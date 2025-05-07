import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function getConversation(conversationId: number){
    const rows = await prisma.conversation_history.findMany({
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

    return result;
    
}