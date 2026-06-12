import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LoginLogDocument = LoginLog & Document;

@Schema({ timestamps: true, collection: 'login_logs' })
export class LoginLog {
  @Prop({ required: true })
  userId: string;

  @Prop()
  userAgent?: string;
}

export const LoginLogSchema = SchemaFactory.createForClass(LoginLog);
