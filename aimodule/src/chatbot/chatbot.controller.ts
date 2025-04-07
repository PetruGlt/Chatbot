import { Controller, Get, Query } from '@nestjs/common';
import { ChatbotService } from './chatbot.service'; 

@Controller('chatbot')
export class ChatbotController {

    constructor(private chatbotService: ChatbotService) {}

    @Get('ask')
    public async ask(@Query('question') question) {
        if(question == null)
            return "Please provide a prompt.";
        return await this.chatbotService.ask(question);
    }
}
