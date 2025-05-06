import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class ChatbotService {

    private apiClient;

    constructor(private configService: ConfigService) {
        this.apiClient = new GoogleGenAI({
            googleAuthOptions: {
                apiKey: this.configService.get("GOOGLE_API_KEY")
            }
        })
    }

    public async ask(history, prompt) {
        return await this.sendPrompt(history, prompt);
    }

    private async sendPrompt(history, prompt) {
        const chat = await this.apiClient.chats.create({
            model: this.configService.get("GOOGLE_AI_MODEL"),
            history: history,
        });

        const response = await chat.sendMessage({
            message: prompt
        });

        const output = response.candidates[0].content.parts.map(obj => obj.text).join('');
        
        return output;
    }
}
