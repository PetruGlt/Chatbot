import { Body, Controller, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ConversationService } from '../conversation/conversation.service';

@Controller('chatbot')
export class ChatbotController {

    constructor(private chatbotService: ChatbotService, private conversationService: ConversationService) {}

    @Post('ask')
    public async ask(@Body() body) {
        if(body == null)
            return "Please provide a request body.";
        
        if(body.conversationId) {
            const conversation = await this.conversationService.getHistory(body.conversationId);
            
            const answer = await this.chatbotService.ask(conversation, body.prompt);
            
            return { 
                answer: answer 
            };
        } else {
            return "Please provide the conversationId."; 
        }
    }
}