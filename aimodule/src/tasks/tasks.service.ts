import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChatbotService } from 'src/chatbot/chatbot.service';
import { ConversationService } from 'src/conversation/conversation.service';

@Injectable()
export class TasksService {

    public constructor(
        private readonly conversationService: ConversationService,
        private readonly chatbotService: ChatbotService
    ) {}

    @Cron('0 0 * * *')
    public async trainModel() {
        const entries = await this.conversationService.getInvalidResponses();
        const trainingData = entries.map((entry) => {
            return {
                text_input: entry.question,
                output: entry.updated_response
            }
        })
        await this.chatbotService.startTraining(trainingData);
        await this.conversationService.updateInvalidResponses(entries);
    }
}
