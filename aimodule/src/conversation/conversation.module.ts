import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({})
export class ConversationModule {
    providers: [ PrismaService ]
}
