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
        
        const daSauNu = await this.apiClient.models.generateContent({
            model: "gemini-1.5-flash",
            contents: `Esti un asistent bancar. Scopul tau este sa raspunzi la prompt-uri cu informatii din domeniul bancar. Poate fi acest prompt folosit in contextul bancar: "${prompt}" ?`,
            config: {
              systemInstruction: `Ai voie sa raspunzi doar cu "da" sau "nu"`,
            },
          });
        
        const decision = daSauNu.response.candidates?.[0]?.content.parts?.[0]?.text?.trim().toLowerCase();

        if (decision !== 'da'){
            return 'Imi pare rau, nu pot raspunde la aceasta intrebare.';
        }
        
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
