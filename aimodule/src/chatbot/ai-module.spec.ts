import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { ConversationService } from '../conversation/conversation.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { ChatbotModule } from './chatbot.module';
import { ConversationModule } from '../conversation/conversation.module';
import { PrismaModule } from '../prisma/prisma.module';

const mockGoogleGenAI = {
    models: {
        generateContent: jest.fn(),
    },
    chats: {
        create: jest.fn(),
    },
};

jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => mockGoogleGenAI),
}));

describe('AI Module Complete Tests', () => {
    let chatbotService: ChatbotService;
    let chatbotController: ChatbotController;
    let conversationService: ConversationService;
    let prismaService: PrismaService;
    let configService: ConfigService;

    const mockPrismaService = {
        conversation_history: {
            findMany: jest.fn(),
        },
        $connect: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatbotController],
            providers: [
                ChatbotService,
                ConversationService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockImplementation((key: string) => {
                            if (key === 'GOOGLE_API_KEY') return 'test-api-key';
                            if (key === 'GOOGLE_AI_MODEL') return 'gemini-1.5-flash';
                            return null;
                        }),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        chatbotService = module.get<ChatbotService>(ChatbotService);
        chatbotController = module.get<ChatbotController>(ChatbotController);
        conversationService = module.get<ConversationService>(ConversationService);
        prismaService = module.get<PrismaService>(PrismaService);
        configService = module.get<ConfigService>(ConfigService);
    });

    describe('ChatbotService', () => {
        describe('ask method', () => {
            it('ar trebui să returneze răspuns pentru întrebare bancară validă', async () => {
                const history = [];
                const prompt = 'Care este dobanda la credite?';

                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: 'da' }]
                        }
                    }]
                });

                const mockChat = {
                    sendMessage: jest.fn().mockResolvedValueOnce({
                        candidates: [{
                            finishReason: 'STOP',
                            content: {
                                parts: [{ text: 'Dobanda variază între 5-7%.' }]
                            }
                        }]
                    })
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                const result = await chatbotService.ask(history, prompt);
                expect(result).toBe('Dobanda variază între 5-7%.');
            });

            it('ar trebui să refuze întrebare non-bancară', async () => {
                const prompt = 'Cum gătesc paste?';

                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: 'nu' }]
                        }
                    }]
                });

                const result = await chatbotService.ask([], prompt);
                expect(result).toBe('Imi pare rau, nu pot raspunde la aceasta intrebare.');
            });

            it('ar trebui să refuze răspuns SAFETY', async () => {
                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: 'da' }]
                        }
                    }]
                });

                const mockChat = {
                    sendMessage: jest.fn().mockResolvedValueOnce({
                        candidates: [{
                            finishReason: 'SAFETY',
                            content: {
                                parts: [{ text: 'Blocked' }]
                            }
                        }]
                    })
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                const result = await chatbotService.ask([], 'Test safety');
                expect(result).toBe('Imi pare rau, nu pot raspunde la aceasta intrebare.');
            });

            it('ar trebui să gestioneze răspuns cu mai multe părți', async () => {
                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: 'DA' }]
                        }
                    }]
                });

                const mockChat = {
                    sendMessage: jest.fn().mockResolvedValueOnce({
                        candidates: [{
                            finishReason: 'STOP',
                            content: {
                                parts: [
                                    { text: 'Part 1 ' },
                                    { text: 'Part 2 ' },
                                    { text: 'Part 3' }
                                ]
                            }
                        }]
                    })
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                const result = await chatbotService.ask([], 'Test parts');
                expect(result).toBe('Part 1 Part 2 Part 3');
            });

            it('ar trebui să trimită istoric corect', async () => {
                const history = [
                    { role: 'user', parts: [{ text: 'Q1' }] },
                    { role: 'model', parts: [{ text: 'A1' }] }
                ];

                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: 'da' }]
                        }
                    }]
                });

                const mockChat = {
                    sendMessage: jest.fn().mockResolvedValueOnce({
                        candidates: [{
                            finishReason: 'STOP',
                            content: {
                                parts: [{ text: 'Response' }]
                            }
                        }]
                    })
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                await chatbotService.ask(history, 'New question');

                expect(mockGoogleGenAI.chats.create).toHaveBeenCalledWith({
                    model: 'gemini-1.5-flash',
                    history: history,
                });
            });

            it('ar trebui să gestioneze erori API', async () => {
                mockGoogleGenAI.models.generateContent.mockRejectedValueOnce(
                    new Error('API Error')
                );

                await expect(chatbotService.ask([], 'Test')).rejects.toThrow('API Error');
            });

            it('ar trebui să gestioneze răspuns gol', async () => {
                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: '' }]
                        }
                    }]
                });

                const result = await chatbotService.ask([], 'Test empty');
                expect(result).toBe('Imi pare rau, nu pot raspunde la aceasta intrebare.');
            });

            it('ar trebui să gestioneze răspuns cu spații', async () => {
                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: '  DA  ' }]
                        }
                    }]
                });

                const mockChat = {
                    sendMessage: jest.fn().mockResolvedValueOnce({
                        candidates: [{
                            finishReason: 'STOP',
                            content: {
                                parts: [{ text: 'OK' }]
                            }
                        }]
                    })
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                const result = await chatbotService.ask([], 'Test trim');
                expect(result).toBe('OK');
            });

            it('ar trebui să gestioneze răspuns undefined', async () => {
                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{}]
                });

                await expect(chatbotService.ask([], 'Test')).rejects.toThrow();
            });

            it('ar trebui să gestioneze eroare în chat', async () => {
                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: 'da' }]
                        }
                    }]
                });

                mockGoogleGenAI.chats.create.mockRejectedValueOnce(new Error('Chat Error'));

                await expect(chatbotService.ask([], 'Test')).rejects.toThrow('Chat Error');
            });
        });

        describe('sendPrompt private method', () => {
            it('ar trebui să apeleze ask care apelează sendPrompt', async () => {
                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: 'da' }]
                        }
                    }]
                });

                const mockChat = {
                    sendMessage: jest.fn().mockResolvedValueOnce({
                        candidates: [{
                            finishReason: 'STOP',
                            content: {
                                parts: [{ text: 'Test private' }]
                            }
                        }]
                    })
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                const result = await chatbotService.ask([], 'Test');
                expect(result).toBe('Test private');
            });
        });

        describe('constructor', () => {
            it('ar trebui să inițializeze cu config service', () => {
                expect(configService.get).toHaveBeenCalledWith('GOOGLE_API_KEY');
                expect(chatbotService).toBeDefined();
            });
        });
    });

    describe('ChatbotController', () => {
        describe('ask endpoint', () => {
            it('ar trebui să returneze răspuns pentru request valid', async () => {
                const mockBody = {
                    conversationId: 'test-123',
                    prompt: 'Care este soldul meu?'
                };

                const mockHistory = [];
                const mockAnswer = 'Soldul este 1000 RON.';

                jest.spyOn(conversationService, 'getHistory').mockResolvedValueOnce(mockHistory);
                jest.spyOn(chatbotService, 'ask').mockResolvedValueOnce(mockAnswer);

                const result = await chatbotController.ask(mockBody);

                expect(result).toEqual({ answer: mockAnswer });
                expect(conversationService.getHistory).toHaveBeenCalledWith('test-123');
                expect(chatbotService.ask).toHaveBeenCalledWith(mockHistory, 'Care este soldul meu?');
            });

            it('ar trebui să returneze eroare pentru body null', async () => {
                const result = await chatbotController.ask(null);
                expect(result).toBe('Please provide a request body.');
            });

            it('ar trebui să returneze eroare pentru body undefined', async () => {
                const result = await chatbotController.ask(undefined);
                expect(result).toBe('Please provide a request body.');
            });

            it('ar trebui să returneze eroare pentru lipsă conversationId', async () => {
                const mockBody = {
                    prompt: 'O întrebare'
                };

                const result = await chatbotController.ask(mockBody);
                expect(result).toBe('Please provide the conversationId.');
            });

            it('ar trebui să returneze eroare pentru conversationId gol', async () => {
                const mockBody = {
                    conversationId: '',
                    prompt: 'O întrebare'
                };

                const result = await chatbotController.ask(mockBody);
                expect(result).toBe('Please provide the conversationId.');
            });

            it('ar trebui să gestioneze istoric gol', async () => {
                const mockBody = {
                    conversationId: 'new-conv',
                    prompt: 'Prima întrebare'
                };

                jest.spyOn(conversationService, 'getHistory').mockResolvedValueOnce([]);
                jest.spyOn(chatbotService, 'ask').mockResolvedValueOnce('Primul răspuns');

                const result = await chatbotController.ask(mockBody);
                expect(result).toEqual({ answer: 'Primul răspuns' });
            });

            it('ar trebui să gestioneze erori din service', async () => {
                const mockBody = {
                    conversationId: 'test-123',
                    prompt: 'Test error'
                };

                jest.spyOn(conversationService, 'getHistory').mockRejectedValueOnce(new Error('DB Error'));

                await expect(chatbotController.ask(mockBody)).rejects.toThrow('DB Error');
            });

            it('ar trebui să gestioneze prompt gol', async () => {
                const mockBody = {
                    conversationId: 'test-123',
                    prompt: ''
                };

                jest.spyOn(conversationService, 'getHistory').mockResolvedValueOnce([]);
                jest.spyOn(chatbotService, 'ask').mockResolvedValueOnce('');

                const result = await chatbotController.ask(mockBody);
                expect(result).toEqual({ answer: '' });
            });

            it('ar trebui să accepte body cu proprietăți extra', async () => {
                const mockBody = {
                    conversationId: 'test-123',
                    prompt: 'Test',
                    extraProp: 'ignored'
                };

                jest.spyOn(conversationService, 'getHistory').mockResolvedValueOnce([]);
                jest.spyOn(chatbotService, 'ask').mockResolvedValueOnce('OK');

                const result = await chatbotController.ask(mockBody);
                expect(result).toEqual({ answer: 'OK' });
            });
        });

        describe('constructor', () => {
            it('ar trebui să injecteze dependențele corect', () => {
                expect(chatbotController).toBeDefined();
                expect(chatbotService).toBeDefined();
                expect(conversationService).toBeDefined();
            });
        });
    });

    describe('ConversationService', () => {
        describe('getHistory method', () => {
            it('ar trebui să returneze istoric formatat corect', async () => {
                const conversationId = 'test-123';
                const mockRows = [
                    {
                        id: 1,
                        conversation_id: conversationId,
                        question: 'Q1',
                        answer: 'A1',
                    },
                    {
                        id: 2,
                        conversation_id: conversationId,
                        question: 'Q2',
                        answer: 'A2',
                    },
                ];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(mockRows);

                const result = await conversationService.getHistory(conversationId, 'user');

                expect(result).toEqual([
                    { role: 'user', parts: [{ text: 'Q1' }] },
                    { role: 'model', parts: [{ text: 'A1' }] },
                    { role: 'user', parts: [{ text: 'Q2' }] },
                    { role: 'model', parts: [{ text: 'A2' }] },
                ]);

                expect(mockPrismaService.conversation_history.findMany).toHaveBeenCalledWith({
                    where: { conversation_id: conversationId },
                    orderBy: { id: 'asc' },
                });
            });

            it('ar trebui să returneze array gol pentru conversație inexistentă', async () => {
                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce([]);

                const result = await conversationService.getHistory('inexistent', 'user');
                expect(result).toEqual([]);
            });

            it('ar trebui să gestioneze null values', async () => {
                const mockRows = [
                    {
                        id: 1,
                        conversation_id: 'test',
                        question: null,
                        answer: 'A1',
                    },
                    {
                        id: 2,
                        conversation_id: 'test',
                        question: 'Q2',
                        answer: null,
                    },
                ];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(mockRows);

                const result = await conversationService.getHistory('test', 'user');

                expect(result).toEqual([
                    { role: 'user', parts: [{ text: null }] },
                    { role: 'model', parts: [{ text: 'A1' }] },
                    { role: 'user', parts: [{ text: 'Q2' }] },
                    { role: 'model', parts: [{ text: null }] },
                ]);
            });

            it('ar trebui să gestioneze erori de DB', async () => {
                mockPrismaService.conversation_history.findMany.mockRejectedValueOnce(
                    new Error('DB Connection Error')
                );

                await expect(conversationService.getHistory('test', 'user')).rejects.toThrow('DB Connection Error');
            });

            it('ar trebui să proceseze un singur rând', async () => {
                const mockRows = [{
                    id: 1,
                    conversation_id: 'single',
                    question: 'Single Q',
                    answer: 'Single A',
                }];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(mockRows);

                const result = await conversationService.getHistory('single', 'user');
                expect(result).toHaveLength(2);
            });

            it('ar trebui să gestioneze strings goale', async () => {
                const mockRows = [{
                    id: 1,
                    conversation_id: 'empty',
                    question: '',
                    answer: '',
                }];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(mockRows);

                const result = await conversationService.getHistory('empty', 'user');
                expect(result).toEqual([
                    { role: 'user', parts: [{ text: '' }] },
                    { role: 'model', parts: [{ text: '' }] },
                ]);
            });

            it('ar trebui să păstreze ordinea după id', async () => {
                const unorderedRows = [
                    { id: 3, conversation_id: 'test', question: 'Q3', answer: 'A3' },
                    { id: 1, conversation_id: 'test', question: 'Q1', answer: 'A1' },
                    { id: 2, conversation_id: 'test', question: 'Q2', answer: 'A2' },
                ];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(unorderedRows);

                const result = await conversationService.getHistory('test', 'user');

                expect(result[0].parts[0].text).toBe('Q3');
                expect(result[2].parts[0].text).toBe('Q1');
                expect(result[4].parts[0].text).toBe('Q2');
            });
        });

        describe('constructor', () => {
            it('ar trebui să injecteze PrismaService', () => {
                expect(conversationService).toBeDefined();
                expect(prismaService).toBeDefined();
            });
        });
    });

    describe('PrismaService', () => {
        it('ar trebui să apeleze $connect la init', async () => {
            const prismaInstance = new PrismaService();
            prismaInstance.$connect = jest.fn();

            await prismaInstance.onModuleInit();

            expect(prismaInstance.$connect).toHaveBeenCalled();
        });
    });
});

describe('App Module Tests', () => {
    let appController: AppController;
    let appService: AppService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();

        appController = module.get<AppController>(AppController);
        appService = module.get<AppService>(AppService);
    });

    it('should return "Hello World!"', () => {
        expect(appController.getHello()).toBe('Hello World!');
    });

    it('app service should be defined', () => {
        expect(appService).toBeDefined();
        expect(appService.getHello()).toBe('Hello World!');
    });
});
