import { Module } from '@nestjs/common';
import { ConversationService } from 'src/conversation/conversation.service';
import { TasksService } from './tasks.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatbotService } from 'src/chatbot/chatbot.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    providers: [TasksService, ConversationService, PrismaService, ChatbotService]
})
export class TasksModule {
}
