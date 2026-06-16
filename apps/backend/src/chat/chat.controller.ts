import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':lessonId')
  async getHistory(@Param('lessonId') lessonId: string) {
    const messages = await this.chatService.getHistory(lessonId);
    return { lessonId, messages };
  }

  @Post(':lessonId')
  async sendMessage(
    @Param('lessonId') lessonId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      lessonId,
      dto.message,
      dto.imageBase64,
      dto.imageMimeType,
    );
  }

  @Delete(':lessonId')
  async clearHistory(@Param('lessonId') lessonId: string) {
    await this.chatService.clearHistory(lessonId);
    return { ok: true };
  }
}
