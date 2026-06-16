import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StreakDocument = Streak & Document;

@Schema({ timestamps: true, collection: 'streaks' })
export class Streak {
  /** Single-user app: one streak document, keyed by a fixed id */
  @Prop({ required: true, unique: true, default: 'me' })
  key: string;

  @Prop({ default: 0 })
  currentCount: number;

  @Prop({ default: 0 })
  longestCount: number;

  @Prop({ default: 0 })
  freezeTokens: number;

  /** Last study date as YYYY-MM-DD */
  @Prop({ default: null })
  lastStudyDate: string | null;

  /** Monday of the last week that qualified (≥4 study days) */
  @Prop({ default: null })
  lastStreakWeek: string | null;
}

export const StreakSchema = SchemaFactory.createForClass(Streak);
