import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ConversationService } from 'src/conversation/conversation.service';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, ConversationService],
})
export class ChatbotModule {}
