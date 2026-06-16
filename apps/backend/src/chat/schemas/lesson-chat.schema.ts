import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LessonChatDocument = LessonChat & Document;

export class ChatMessage {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @Prop({ required: true })
  content: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

@Schema({ timestamps: true, collection: 'lesson_chats' })
export class LessonChat {
  @Prop({ required: true, unique: true, index: true })
  lessonId: string;

  @Prop({ type: [Object], default: [] })
  messages: ChatMessage[];
}

export const LessonChatSchema = SchemaFactory.createForClass(LessonChat);
