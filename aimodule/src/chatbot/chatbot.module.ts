import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ConversationService } from '../conversation/conversation.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, ConversationService, PrismaService],
})
export class ChatbotModule {}
