import { Body, Controller, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service'; 

@Controller('chatbot')
export class ChatbotController {

    constructor(private chatbotService: ChatbotService) {}

    @Post('ask')
    public async ask(@Body() body) {
        if(body == null)
            return "Please provide a prompt.";
        
        return await this.chatbotService.ask(body.question);
    }
}
