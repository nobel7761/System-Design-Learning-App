import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get(':lessonId')
  getQuiz(@Param('lessonId') lessonId: string) {
    return this.quizService.getQuizForLesson(lessonId);
  }

  @Post(':lessonId/submit')
  submitQuiz(
    @Param('lessonId') lessonId: string,
    @Body() submitQuizDto: SubmitQuizDto,
  ) {
    return this.quizService.submitQuiz(lessonId, submitQuizDto);
  }
}
