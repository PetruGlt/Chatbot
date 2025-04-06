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

    public async ask(question) {
        return await this.sendPrompt(question);
    }

    private async sendPrompt(prompt) {
        const response = await this.apiClient.models.generateContent({
            model: this.configService.get("GOOGLE_AI_MODEL"),
            contents: prompt,
        });
        return response.candidates[0].content.parts[0].text;
    }
}
