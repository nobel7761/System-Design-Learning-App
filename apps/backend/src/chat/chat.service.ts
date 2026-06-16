import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { CurriculumService } from '../curriculum/curriculum.service';
import {
  LessonChat,
  LessonChatDocument,
  ChatMessage,
} from './schemas/lesson-chat.schema';

@Injectable()
export class ChatService {
  private readonly openai: OpenAI;

  constructor(
    @InjectModel(LessonChat.name)
    private readonly chatModel: Model<LessonChatDocument>,
    private readonly curriculumService: CurriculumService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async getHistory(lessonId: string): Promise<ChatMessage[]> {
    const doc = await this.chatModel.findOne({ lessonId }).lean().exec();
    return doc?.messages ?? [];
  }

  async sendMessage(
    lessonId: string,
    userMessage: string,
    imageBase64?: string,
    imageMimeType?: string,
  ): Promise<{ reply: string }> {
    // Look up lesson context
    let lessonTitle = lessonId;
    let worldTitle = '';
    try {
      const lesson = this.curriculumService.getLesson(lessonId);
      lessonTitle = `${lesson.title} (${lesson.titleEn})`;
      const worlds = this.curriculumService.getWorlds();
      const world = worlds.find((w) =>
        w.lessons.some((l) => l.id === lessonId),
      );
      if (world) worldTitle = world.title;
    } catch {
      // continue without context
    }

    let doc = await this.chatModel.findOne({ lessonId }).exec();
    if (!doc) {
      doc = new this.chatModel({ lessonId, messages: [] });
    }

    const history = doc.messages as ChatMessage[];

    const systemPrompt = `তুমি Achievement Academy-র একজন বন্ধুবৎসল বাংলা tutor। শিক্ষার্থী এখন "${lessonTitle}" lesson পড়ছে${worldTitle ? ` (${worldTitle} world)` : ''}.

সবসময় বাংলায় উত্তর দাও। উত্তর সহজ ভাষায় দাও (ELI5 style)। Real-world উদাহরণ ও analogy ব্যবহার করো। সংক্ষিপ্ত রাখো (২-৪ বাক্য)। উৎসাহী ও ইতিবাচক থাকো। যদি image share করা হয় তাহলে সেটা দেখে প্রশ্নের উত্তর দাও।`;

    // Build message history for OpenAI (text-only past messages)
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Build current user message — with image if provided
    const hasImage = !!(imageBase64 && imageMimeType);
    if (hasImage) {
      const content: OpenAI.Chat.ChatCompletionContentPart[] = [
        {
          type: 'image_url',
          image_url: {
            url: `data:${imageMimeType};base64,${imageBase64}`,
            detail: 'high',
          },
        },
      ];
      if (userMessage.trim()) {
        content.push({ type: 'text', text: userMessage });
      }
      messages.push({ role: 'user', content });
    } else {
      messages.push({ role: 'user', content: userMessage });
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content ?? '';

    // Store text-only version (images are not persisted to keep DB lean)
    const storedUserText = hasImage
      ? userMessage.trim()
        ? `📷 [Image] ${userMessage}`
        : '📷 [Image]'
      : userMessage;

    doc.messages.push(
      { role: 'user', content: storedUserText, createdAt: new Date() },
      { role: 'assistant', content: reply, createdAt: new Date() },
    );
    await doc.save();

    return { reply };
  }

  async clearHistory(lessonId: string): Promise<void> {
    await this.chatModel
      .updateOne({ lessonId }, { $set: { messages: [] } })
      .exec();
  }
}
