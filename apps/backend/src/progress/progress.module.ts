import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import {
  LessonProgress,
  LessonProgressSchema,
} from './schemas/lesson-progress.schema';
import { SessionLog, SessionLogSchema } from './schemas/session-log.schema';
import { Streak, StreakSchema } from './schemas/streak.schema';

@Module({
  imports: [
    CurriculumModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: SessionLog.name, schema: SessionLogSchema },
      { name: Streak.name, schema: StreakSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
