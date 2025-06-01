import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationService {

    constructor(private readonly prisma: PrismaService) {}

    public async getHistory(conversationId, userName) {
        const rows = await this.prisma.conversation_history.findMany({
            where: { 
                conversation_id: conversationId,
                user: userName
            },
            orderBy: { id: 'asc' }
        });
        
        type Message = {
            role: "user" | "model";
            parts: { text: string}[];
        };
    
        const result: Message[] = [];
    
        for(const row of rows){
            result.push({
                role: "user",
                parts: [{text: row.question}],
            });
            result.push({
                role : "model",
                parts: [{text: row.answer}],
            });
        }
    
        return result;
    }

    public async getInvalidResponses() {
        return await this.prisma.conversation_history.findMany({
            where: {
                checked: true,
                trained: false,
                NOT: {
                    updated_response: null
                },
            },
            take: 10
        });
    }

    public async updateInvalidResponses(entries) {
        return await this.prisma.conversation_history.updateMany({
            where: {
                OR: entries
            },
            data: {
                trained: true
            }
        });
    }
}
