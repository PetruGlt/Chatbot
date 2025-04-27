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
        const chat = await this.apiClient.chats.create({
            model: this.configService.get("GOOGLE_AI_MODEL"),
            history: [
                {
                    role: "user",
                    parts: [{ text: "Există un comision pentru deschiderea unui cont curent?" }],
                },
                {
                    role: "model",
                    parts: [{ text: "În general, nu se percepe un comision de deschidere pentru conturile curente. Totuși, pot exista cazuri speciale în care se aplică o taxă. E important să verifici tarifele actualizate direct pe site-ul băncii pentru a fi la curent cu costurile." }],
                },
            ],
        });

        const response = await chat.sendMessage({
            message: prompt
        });

        const output = response.candidates[0].content.parts.map(obj => obj.text).join('');
        
        return output;
    }
}
