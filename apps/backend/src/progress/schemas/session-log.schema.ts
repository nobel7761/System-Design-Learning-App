import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionLogDocument = SessionLog & Document;

@Schema({ timestamps: true, collection: 'session_logs' })
export class SessionLog {
  /** Local study date as YYYY-MM-DD (one entry per completed session) */
  @Prop({ required: true, index: true })
  date: string;

  @Prop({ required: true })
  lessonId: string;

  @Prop({ required: true })
  xpEarned: number;

  @Prop({ default: 0 })
  timeSpentSec: number;
}

export const SessionLogSchema = SchemaFactory.createForClass(SessionLog);
