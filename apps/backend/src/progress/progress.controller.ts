import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('dashboard')
  getDashboard(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.progressService.getDashboard(user.userId);
  }

  @Get('syllabus')
  getSyllabus() {
    return this.progressService.getSyllabus();
  }
}
