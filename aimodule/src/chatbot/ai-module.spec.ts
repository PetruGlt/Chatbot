import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { ConversationService } from '../conversation/conversation.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { PrismaClient } from '@prisma/client';
import { ChatbotModule } from './chatbot.module';
import { ConversationModule } from '../conversation/conversation.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AppModule } from '../app.module';

const mockBootstrap = jest.fn().mockImplementation(async () => {
    const app = await mockCreateFn(AppModule);
    await app.listen(process.env.PORT ?? 3000);
    return app;
});

jest.doMock('../main', () => ({
    bootstrap: mockBootstrap
}));

const { bootstrap } = require('../main');



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

const mockListenFn = jest.fn().mockResolvedValue(undefined);
const mockApp = { listen: mockListenFn };
const mockCreateFn = jest.fn().mockResolvedValue(mockApp);

jest.doMock('@nestjs/core', () => ({
    NestFactory: {
        create: mockCreateFn
    }
}));

const { NestFactory } = require('@nestjs/core');

jest.mock('../main', () => {
    const bootstrap = async () => {
        const app = await mockCreateFn(AppModule);
        await app.listen(process.env.PORT ?? 3000);
        return app;
    };
    return { bootstrap };
});


describe('AI Module Complete Tests', () => {
    let chatbotService: ChatbotService;
    let chatbotController: ChatbotController;
    let conversationService: ConversationService;
    let prismaService: PrismaService;
    let configService: ConfigService;

    const mockPrismaService = {
        conversation_history: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $on: jest.fn(),
    };
    mockPrismaService.conversation_history.findMany.mockImplementation(async () => {
        return [];  // Returnează array gol în caz de eșec
    });
    beforeEach(async () => {
        jest.clearAllMocks();

        const module = await Test.createTestingModule({
            controllers: [ChatbotController],
            providers: [
                ChatbotService,
                ConversationService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockImplementation((key) => {
                            if (key === 'GOOGLE_API_KEY') return 'test-api-key';
                            if (key === 'GOOGLE_AI_MODEL') return 'gemini-1.5-flash';
                            if (key === 'PORT') return '3000';
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

            it('ar trebui să gestioneze eroare în sendMessage', async () => {
                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: 'da' }]
                        }
                    }]
                });

                const mockChat = {
                    sendMessage: jest.fn().mockRejectedValueOnce(new Error('SendMessage Error'))
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                await expect(chatbotService.ask([], 'Test')).rejects.toThrow('SendMessage Error');
            });

            it('ar trebui să gestioneze lipsă candidați în răspunsul sendMessage', async () => {
                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: 'da' }]
                        }
                    }]
                });

                const mockChat = {
                    sendMessage: jest.fn().mockResolvedValueOnce({})
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                await expect(chatbotService.ask([], 'Test')).rejects.toThrow();
            });

            it('ar trebui să gestioneze lipsă finishReason în răspunsul sendMessage', async () => {
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
                            content: {
                                parts: [{ text: 'Test' }]
                            }
                        }]
                    })
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                const result = await chatbotService.ask([], 'Test');
                expect(result).toBe('Test');
            });

            it('ar trebui să gestioneze lipsă content în răspunsul sendMessage', async () => {
                mockGoogleGenAI.models.generateContent.mockResolvedValueOnce({
                    candidates: [{
                        content: {
                            parts: [{ text: 'da' }]
                        }
                    }]
                });

                const mockChat = {
                    sendMessage: jest.fn().mockResolvedValueOnce({
                        candidates: [{}]
                    })
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                await expect(chatbotService.ask([], 'Test')).rejects.toThrow();
            });

            it('ar trebui să gestioneze un alt finishReason decât SAFETY sau STOP', async () => {
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
                            finishReason: 'OTHER_REASON',
                            content: {
                                parts: [{ text: 'Other finish reason' }]
                            }
                        }]
                    })
                };
                mockGoogleGenAI.chats.create.mockResolvedValueOnce(mockChat);

                const result = await chatbotService.ask([], 'Test');
                expect(result).toBe('Other finish reason');
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

            it('ar trebui să inițializeze GoogleGenAI cu cheie API', () => {
                const newService = new ChatbotService(configService);
                expect(configService.get).toHaveBeenCalledWith('GOOGLE_API_KEY');
            });
        });
    });

    describe('ChatbotController', () => {
        describe('ask endpoint', () => {
            it('ar trebui să returneze răspuns pentru request valid', async () => {
                const mockBody = {
                    conversationId: 'test-123',
                    userName: 'test-user',
                    prompt: 'Care este soldul meu?'
                };

                const mockHistory = [];
                const mockAnswer = 'Soldul este 1000 RON.';

                jest.spyOn(conversationService, 'getHistory').mockResolvedValueOnce(mockHistory);
                jest.spyOn(chatbotService, 'ask').mockResolvedValueOnce(mockAnswer);

                const result = await chatbotController.ask(mockBody);

                expect(result).toEqual({ answer: mockAnswer });
                expect(conversationService.getHistory).toHaveBeenCalledWith('test-123', 'test-user');
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
                    userName: 'test-user',
                    prompt: 'O întrebare'
                };

                const result = await chatbotController.ask(mockBody);
                expect(result).toBe('Please provide the conversationId.');
            });

            it('ar trebui să returneze eroare pentru lipsă userName', async () => {
                const mockBody = {
                    conversationId: 'test-123',
                    prompt: 'O întrebare'
                };

                const result = await chatbotController.ask(mockBody);
                expect(result).toBe('Please provide the conversationId.');
            });

            it('ar trebui să returneze eroare pentru conversationId gol', async () => {
                const mockBody = {
                    conversationId: '',
                    userName: 'test-user',
                    prompt: 'O întrebare'
                };

                const result = await chatbotController.ask(mockBody);
                expect(result).toBe('Please provide the conversationId.');
            });

            it('ar trebui să returneze eroare pentru userName gol', async () => {
                const mockBody = {
                    conversationId: 'test-123',
                    userName: '',
                    prompt: 'O întrebare'
                };

                const result = await chatbotController.ask(mockBody);
                expect(result).toBe('Please provide the conversationId.');
            });

            it('ar trebui să gestioneze istoric gol', async () => {
                const mockBody = {
                    conversationId: 'new-conv',
                    userName: 'test-user',
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
                    userName: 'test-user',
                    prompt: 'Test error'
                };

                jest.spyOn(conversationService, 'getHistory').mockRejectedValueOnce(new Error('DB Error'));

                await expect(chatbotController.ask(mockBody)).rejects.toThrow('DB Error');
            });

            it('ar trebui să gestioneze prompt gol', async () => {
                const mockBody = {
                    conversationId: 'test-123',
                    userName: 'test-user',
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
                    userName: 'test-user',
                    prompt: 'Test',
                    extraProp: 'ignored'
                };

                jest.spyOn(conversationService, 'getHistory').mockResolvedValueOnce([]);
                jest.spyOn(chatbotService, 'ask').mockResolvedValueOnce('OK');

                const result = await chatbotController.ask(mockBody);
                expect(result).toEqual({ answer: 'OK' });
            });

            it('ar trebui să gestioneze erori în chatbotService.ask', async () => {
                const mockBody = {
                    conversationId: 'test-123',
                    userName: 'test-user',
                    prompt: 'Test'
                };

                jest.spyOn(conversationService, 'getHistory').mockResolvedValueOnce([]);
                jest.spyOn(chatbotService, 'ask').mockRejectedValueOnce(new Error('Service Error'));

                await expect(chatbotController.ask(mockBody)).rejects.toThrow('Service Error');
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
                const userName = 'test-user';
                const mockRows = [
                    {
                        id: 1,
                        conversation_id: conversationId,
                        user: userName,
                        question: 'Q1',
                        answer: 'A1',
                    },
                    {
                        id: 2,
                        conversation_id: conversationId,
                        user: userName,
                        question: 'Q2',
                        answer: 'A2',
                    },
                ];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(mockRows);

                const result = await conversationService.getHistory(conversationId, userName);

                expect(result).toEqual([
                    { role: 'user', parts: [{ text: 'Q1' }] },
                    { role: 'model', parts: [{ text: 'A1' }] },
                    { role: 'user', parts: [{ text: 'Q2' }] },
                    { role: 'model', parts: [{ text: 'A2' }] },
                ]);

                expect(mockPrismaService.conversation_history.findMany).toHaveBeenCalledWith({
                    where: {
                        conversation_id: conversationId,
                        user: userName
                    },
                    orderBy: { id: 'asc' },
                });
            });

            it('ar trebui să returneze array gol pentru conversație inexistentă', async () => {
                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce([]);

                const result = await conversationService.getHistory('inexistent', 'test-user');
                expect(result).toEqual([]);
            });

            it('ar trebui să gestioneze null values', async () => {
                const mockRows = [
                    {
                        id: 1,
                        conversation_id: 'test',
                        user: 'test-user',
                        question: null,
                        answer: 'A1',
                    },
                    {
                        id: 2,
                        conversation_id: 'test',
                        user: 'test-user',
                        question: 'Q2',
                        answer: null,
                    },
                ];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(mockRows);

                const result = await conversationService.getHistory('test', 'test-user');

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

                await expect(conversationService.getHistory('test', 'test-user')).rejects.toThrow('DB Connection Error');
            });

            it('ar trebui să proceseze un singur rând', async () => {
                const mockRows = [{
                    id: 1,
                    conversation_id: 'single',
                    user: 'test-user',
                    question: 'Single Q',
                    answer: 'Single A',
                }];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(mockRows);

                const result = await conversationService.getHistory('single', 'test-user');
                expect(result).toHaveLength(2);
            });

            it('ar trebui să gestioneze strings goale', async () => {
                const mockRows = [{
                    id: 1,
                    conversation_id: 'empty',
                    user: 'test-user',
                    question: '',
                    answer: '',
                }];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(mockRows);

                const result = await conversationService.getHistory('empty', 'test-user');
                expect(result).toEqual([
                    { role: 'user', parts: [{ text: '' }] },
                    { role: 'model', parts: [{ text: '' }] },
                ]);
            });

            it('ar trebui să păstreze ordinea după id', async () => {
                const unorderedRows = [
                    { id: 3, conversation_id: 'test', user: 'test-user', question: 'Q3', answer: 'A3' },
                    { id: 1, conversation_id: 'test', user: 'test-user', question: 'Q1', answer: 'A1' },
                    { id: 2, conversation_id: 'test', user: 'test-user', question: 'Q2', answer: 'A2' },
                ];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(unorderedRows);

                const result = await conversationService.getHistory('test', 'test-user');

                expect(result[0].parts[0].text).toBe('Q3');
                expect(result[2].parts[0].text).toBe('Q1');
                expect(result[4].parts[0].text).toBe('Q2');
            });

            it('ar trebui să verifice userName în query', async () => {
                await conversationService.getHistory('test-id', 'test-user');

                expect(mockPrismaService.conversation_history.findMany).toHaveBeenCalledWith({
                    where: {
                        conversation_id: 'test-id',
                        user: 'test-user'
                    },
                    orderBy: { id: 'asc' },
                });
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

        it('ar trebui să extindă PrismaClient', () => {
            const prismaInstance = new PrismaService();
            expect(prismaInstance instanceof PrismaClient).toBe(true);
        });

        it('ar trebui să implementeze OnModuleInit', () => {
            expect(typeof PrismaService.prototype.onModuleInit).toBe('function');
        });
    });

    describe('ChatbotModule', () => {
        it('ar trebui să fie definit corect', () => {
            expect(ChatbotModule).toBeDefined();
        });

        it('ar trebui să conțină controllerele și providerele corecte', async () => {
            const moduleRef = await Test.createTestingModule({
                imports: [ChatbotModule],
            }).compile();

            const chatbotController = moduleRef.get(ChatbotController);
            const chatbotService = moduleRef.get(ChatbotService);
            const conversationService = moduleRef.get(ConversationService);
            const prismaService = moduleRef.get(PrismaService);

            expect(chatbotController).toBeDefined();
            expect(chatbotService).toBeDefined();
            expect(conversationService).toBeDefined();
            expect(prismaService).toBeDefined();
        });
    });

    describe('ConversationModule', () => {
        it('ar trebui să fie definit corect', () => {
            expect(ConversationModule).toBeDefined();
        });

        it('ar trebui să poată fi inițializat în aplicație', async () => {
            const module = await Test.createTestingModule({
                imports: [ConversationModule],
                providers: [PrismaService]
            }).compile();

            expect(module).toBeDefined();
        });
    });

    describe('PrismaModule', () => {
        it('ar trebui să fie definit corect', () => {
            expect(PrismaModule).toBeDefined();
        });

        it('ar trebui să poată fi inițializat în aplicație', async () => {
            const module = await Test.createTestingModule({
                imports: [PrismaModule],
            }).compile();

            expect(module).toBeDefined();
        });
    });

    describe('AppModule', () => {
        it('ar trebui să fie definit corect', () => {
            expect(AppModule).toBeDefined();
        });

        it('ar trebui să poată fi inițializat cu toate componentele', async () => {
            const module = await Test.createTestingModule({
                imports: [AppModule],
            }).compile();

            describe('AppController', () => {
                let appController: AppController;
                let appService: AppService;

                beforeEach(async () => {
                    const module = await Test.createTestingModule({
                        controllers: [AppController],
                        providers: [AppService],
                    }).compile();

                    appController = module.get<AppController>(AppController);
                    appService = module.get<AppService>(AppService);
                });

                describe('getHello method', () => {
                    it('ar trebui să returneze rezultatul din appService.getHello', () => {
                        const result = 'Test hello result';
                        jest.spyOn(appService, 'getHello').mockReturnValue(result);

                        expect(appController.getHello()).toBe(result);
                        expect(appService.getHello).toHaveBeenCalled();
                    });
                });
            });

            describe('AppService', () => {
                let appService: AppService;

                beforeEach(() => {
                    appService = new AppService();
                });

                describe('getHello method', () => {
                    it('ar trebui să returneze "Hello World!"', () => {
                        expect(appService.getHello()).toBe('Hello World!');
                    });

                    it('ar trebui să returneze un string', () => {
                        const result = appService.getHello();
                        expect(typeof result).toBe('string');
                        expect(result.length).toBeGreaterThan(0);
                    });
                });
            });

            it('ar trebui să gestioneze null values', async () => {
                const mockRows = [
                    {
                        id: 1,
                        conversation_id: 'test',
                        user: 'test-user',
                        question: null,
                        answer: 'A1',
                    },
                    {
                        id: 2,
                        conversation_id: 'test',
                        user: 'test-user',
                        question: 'Q2',
                        answer: null,
                    },
                ];

                mockPrismaService.conversation_history.findMany.mockResolvedValueOnce(mockRows || []);

                const result = await conversationService.getHistory('test', 'test-user');

                expect(result).toEqual([
                    { role: 'user', parts: [{ text: null }] },
                    { role: 'model', parts: [{ text: 'A1' }] },
                    { role: 'user', parts: [{ text: 'Q2' }] },
                    { role: 'model', parts: [{ text: null }] },
                ]);
            });

            const appController = module.get(AppController);
            const appService = module.get(AppService);

            expect(appController).toBeDefined();
            expect(appService).toBeDefined();

            const prismaService = module.get(PrismaService);
            const chatbotService = module.get(ChatbotService);
            const conversationService = module.get(ConversationService);

            expect(prismaService).toBeDefined();
            expect(chatbotService).toBeDefined();
            expect(conversationService).toBeDefined();
        });
    });

    describe('Main bootstrap', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            process.env.PORT = '3000';
        });

        it('ar trebui să apeleze NestFactory.create cu AppModule', async () => {
            await mockBootstrap();
            expect(mockCreateFn).toHaveBeenCalledWith(AppModule);
        });

        it('ar trebui să apeleze app.listen cu portul corect', async () => {
            await mockBootstrap();
            expect(mockListenFn).toHaveBeenCalledWith('3000');
        });

        it('ar trebui să folosească portul implicit 3000 dacă PORT nu este setat', async () => {
            delete process.env.PORT;
            await mockBootstrap();
            expect(mockListenFn).toHaveBeenCalledWith(3000);
        });

        it('ar trebui să returneze app după bootstrap', async () => {
            const result = await mockBootstrap();
            expect(result).toBe(mockApp);
        });

        it('ar trebui să gestioneze erorile la crearea aplicației', async () => {
            mockCreateFn.mockRejectedValueOnce(new Error('Create Error'));
            await expect(mockBootstrap()).rejects.toThrow('Create Error');
        });

        it('ar trebui să gestioneze erorile la pornirea aplicației', async () => {
            mockListenFn.mockRejectedValueOnce(new Error('Listen Error'));
            await expect(mockBootstrap()).rejects.toThrow('Listen Error');
        });
    });
});