import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { LessonChat, LessonChatSchema } from './schemas/lesson-chat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonChat.name, schema: LessonChatSchema },
    ]),
    CurriculumModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
