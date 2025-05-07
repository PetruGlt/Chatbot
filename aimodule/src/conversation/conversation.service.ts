import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationService {

    public async getHistory(conversationId) {
        return {
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
            prompt: "Cum deschid un credit?"
        }
    }
}
