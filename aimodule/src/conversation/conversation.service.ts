import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationService {

    constructor(private readonly prisma: PrismaService) {}

    public async getHistory(conversationId) {
        const rows = await this.prisma.conversation_history.findMany({
            where: { conversation_id: conversationId },
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

        result.pop();
        const prompt = result.pop()?.parts[0]?.text;
    
        return { history: result, prompt };
    }
}
