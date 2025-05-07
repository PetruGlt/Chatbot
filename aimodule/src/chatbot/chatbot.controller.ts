import { Body, Controller, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ConversationService } from '../conversation/conversation.service';

@Controller('chatbot')
export class ChatbotController {

    constructor(private chatbotService: ChatbotService, private conversationService: ConversationService) {}

    @Post('ask')
    public async ask(@Body() body) {
        if(body == null)
            return "Please provide a prompt.";
        
        if(body.conversationId) {
            const conversation = await this.conversationService.getHistory(body.conversationId);
            
            const answer = await this.chatbotService.ask(conversation.history, conversation.prompt);
            
            return { answer };
        } else {
            return await this.chatbotService.ask(body.question);
        }
    }
}