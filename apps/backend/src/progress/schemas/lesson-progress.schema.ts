import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LessonProgressDocument = LessonProgress & Document;

@Schema({ timestamps: true, collection: 'lesson_progress' })
export class LessonProgress {
  @Prop({ required: true, unique: true, index: true })
  lessonId: string;

  @Prop({ required: true, enum: ['done'], default: 'done' })
  status: string;

  @Prop({ required: true })
  bestScore: number;

  @Prop({ required: true })
  completedAt: Date;

  @Prop({ default: 0 })
  timeSpentSec: number;
}

export const LessonProgressSchema =
  SchemaFactory.createForClass(LessonProgress);
