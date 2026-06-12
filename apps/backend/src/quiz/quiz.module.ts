import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { ProgressModule } from '../progress/progress.module';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizAttempt, QuizAttemptSchema } from './schemas/quiz-attempt.schema';

@Module({
  imports: [
    CurriculumModule,
    ProgressModule,
    MongooseModule.forFeature([
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
