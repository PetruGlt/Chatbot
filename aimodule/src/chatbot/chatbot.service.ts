import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; 

@Injectable()
export class ChatbotService {

    private apiClient;

    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        this.apiClient = new GoogleGenAI({
            googleAuthOptions: {
                apiKey: this.configService.get("GOOGLE_API_KEY")
            }
        })
    }

    public async ask(history, prompt) {
        return await this.sendPrompt(history, prompt);
    }

    public async getLatestTunedModel() {
        return this.configService.get("GOOGLE_AI_MODEL")
    }

    public async startTraining(trainingData) {
        const url = `https://generativelanguage.googleapis.com/v1beta/tunedModels?key=${this.configService.get("GOOGLE_API_KEY")}`;

        const payload = {
            "display_name": "banking-chatbot",
            "tuned_model_source": {
                "tuned_model": await this.getLatestTunedModel()
            },
            "tuning_task": {
                "hyperparameters": {
                    "batch_size": 4,
                    "learning_rate": 0.001,
                    "epoch_count": 5
                },
                "training_data": {
                    "examples": {
                        "examples": trainingData
                    }
                }
            }
        };

        try {
            const response = await firstValueFrom(this.httpService.post(url, payload));
            return response.data;
        } catch (error) {
            console.log("POST")
        }
    }

    private async sendPrompt(history, prompt) {
        
        const daSauNu = await this.apiClient.models.generateContent({
            model: "gemini-1.5-flash",
            contents: `Esti un asistent bancar. Scopul tau este sa raspunzi la prompt-uri cu informatii din domeniul bancar. Poate fi acest prompt folosit in contextul bancar: "${prompt}" ?`,
            config: {
              systemInstruction: `Ai voie sa raspunzi doar cu "da" sau "nu"`,
            },
          });
        
        const decision = daSauNu.candidates[0].content.parts[0].text.trim().toLowerCase();

        if (decision !== 'da'){
            return 'Imi pare rau, nu pot raspunde la aceasta intrebare.';
        }
        
        const chat = await this.apiClient.chats.create({
            model: await this.getLatestTunedModel(),
            history: history,
        });

        const response = await chat.sendMessage({
            message: prompt
        });

        if(response.candidates[0].finishReason == 'SAFETY') {
            console.log(response.candidates)
            return 'Imi pare rau, nu pot raspunde la aceasta intrebare.';
        }

        const output = response.candidates[0].content.parts.map(obj => obj.text).join('');
        
        return output;
    }
}
