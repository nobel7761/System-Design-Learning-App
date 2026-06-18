import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurriculumService } from '../curriculum/curriculum.service';
import {
  QuizDifficulty,
  QuizQuestion,
  ServedQuestion,
} from '../curriculum/curriculum.types';
import { ProgressService } from '../progress/progress.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import {
  QuizAttempt,
  QuizAttemptDocument,
} from './schemas/quiz-attempt.schema';

const XP_PER_CORRECT: Record<QuizDifficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
};
const XP_LESSON_COMPLETE = 50;
const XP_BOSS_COMPLETE = 200;
const XP_PERFECT_BONUS = 20;

const LESSON_PASS_PERCENT = 80;
const BOSS_PASS_PERCENT = 75;

/** 20-question lesson quiz: 8 easy / 8 medium / 4 hard */
const LESSON_SAMPLE: Record<QuizDifficulty, number> = {
  easy: 8,
  medium: 8,
  hard: 4,
};
const BOSS_SAMPLE: Record<QuizDifficulty, number> = {
  easy: 0,
  medium: 8,
  hard: 4,
};

@Injectable()
export class QuizService {
  constructor(
    private readonly curriculumService: CurriculumService,
    private readonly progressService: ProgressService,
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
  ) {}

  private shuffle<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private async assertLessonPlayable(lessonId: string) {
    const lesson = this.curriculumService.getLesson(lessonId);
    if (!lesson.contentReady) {
      throw new ForbiddenException(
        'এই lesson-এর content এখনো ready হয়নি — সামনের সপ্তাহগুলোতে আসছে!',
      );
    }
    const status = await this.progressService.getLessonStatus(lessonId);
    if (status === 'locked') {
      throw new ForbiddenException(
        'এই lesson এখনো locked! আগের lesson শেষ করলেই খুলে যাবে।',
      );
    }
    return { lesson, status };
  }

  /** Sample a quiz for a lesson by its difficulty mix (answers stripped) */
  async getQuizForLesson(lessonId: string): Promise<{
    lessonId: string;
    passPercent: number;
    questions: ServedQuestion[];
  }> {
    const { lesson } = await this.assertLessonPlayable(lessonId);
    const bank = this.curriculumService.getQuizBank(lessonId);
    const isBoss = lesson.type === 'boss';
    const sample = isBoss ? BOSS_SAMPLE : LESSON_SAMPLE;

    const byDifficulty: Record<QuizDifficulty, QuizQuestion[]> = {
      easy: [],
      medium: [],
      hard: [],
    };
    for (const q of bank.questions) {
      byDifficulty[q.difficulty]?.push(q);
    }

    const picked: QuizQuestion[] = [];
    const leftovers: QuizQuestion[] = [];
    (Object.keys(sample) as QuizDifficulty[]).forEach((difficulty) => {
      const pool = this.shuffle(byDifficulty[difficulty]);
      picked.push(...pool.slice(0, sample[difficulty]));
      leftovers.push(...pool.slice(sample[difficulty]));
    });

    // If the bank is short on a difficulty, top up from the rest
    const target = Object.values(sample).reduce((a, b) => a + b, 0);
    if (picked.length < target) {
      picked.push(...this.shuffle(leftovers).slice(0, target - picked.length));
    }

    return {
      lessonId,
      passPercent: isBoss ? BOSS_PASS_PERCENT : LESSON_PASS_PERCENT,
      questions: this.shuffle(picked).map((q) => ({
        id: q.id,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
      })),
    };
  }

  /** Full quiz: returns ALL questions from the bank (shuffled). Lesson must be done. */
  async getFullQuizForLesson(lessonId: string) {
    const status = await this.progressService.getLessonStatus(lessonId);
    if (status !== 'done') {
      throw new ForbiddenException(
        'এই lesson এখনো complete হয়নি — আগে main course-এ 80% পেয়ে pass করো।',
      );
    }
    const lesson = this.curriculumService.getLesson(lessonId);
    if (!lesson.contentReady) {
      throw new ForbiddenException('এই lesson-এর content এখনো ready হয়নি।');
    }
    const bank = this.curriculumService.getQuizBank(lessonId);
    return {
      lessonId,
      passPercent: LESSON_PASS_PERCENT,
      questions: this.shuffle(bank.questions).map((q) => ({
        id: q.id,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
      })),
    };
  }

  /** Submit full-quiz attempt. Grades all answers but does NOT change lesson progress. */
  async submitFullQuiz(lessonId: string, dto: SubmitQuizDto) {
    const status = await this.progressService.getLessonStatus(lessonId);
    if (status !== 'done') {
      throw new ForbiddenException('এই lesson এখনো complete হয়নি।');
    }
    const bank = this.curriculumService.getQuizBank(lessonId);
    const questionById = new Map(bank.questions.map((q) => [q.id, q]));

    let correctCount = 0;
    const wrongQuestionIds: string[] = [];
    const perDifficulty: Record<string, [number, number]> = {
      easy: [0, 0],
      medium: [0, 0],
      hard: [0, 0],
    };

    const results = dto.answers.map((answer) => {
      const question = questionById.get(answer.questionId);
      if (!question) {
        throw new BadRequestException(`Unknown question: ${answer.questionId}`);
      }
      const correct = question.answerIndex === answer.answerIndex;
      perDifficulty[question.difficulty][1] += 1;
      if (correct) {
        correctCount += 1;
        perDifficulty[question.difficulty][0] += 1;
      } else {
        wrongQuestionIds.push(question.id);
      }
      return {
        questionId: question.id,
        yourAnswerIndex: answer.answerIndex,
        correctIndex: question.answerIndex,
        correct,
        explanation: question.explanation,
      };
    });

    const score = Math.round((correctCount / dto.answers.length) * 100);
    const passed = score >= LESSON_PASS_PERCENT;

    await this.quizAttemptModel.create({
      lessonId: `review:${lessonId}`,
      attemptNo: 1,
      score,
      passed,
      wrongQuestionIds,
      perDifficulty,
      timeSpentSec: dto.timeSpentSec ?? 0,
    });

    return {
      lessonId,
      score,
      passPercent: LESSON_PASS_PERCENT,
      passed,
      isFirstCompletion: false,
      xpEarned: 0,
      correctCount,
      totalCount: dto.answers.length,
      perDifficulty,
      results,
    };
  }

  async submitQuiz(lessonId: string, dto: SubmitQuizDto) {
    const { lesson, status } = await this.assertLessonPlayable(lessonId);
    const bank = this.curriculumService.getQuizBank(lessonId);
    const questionById = new Map(bank.questions.map((q) => [q.id, q]));
    const isBoss = lesson.type === 'boss';
    const passPercent = isBoss ? BOSS_PASS_PERCENT : LESSON_PASS_PERCENT;
    const expectedCount = Object.values(
      isBoss ? BOSS_SAMPLE : LESSON_SAMPLE,
    ).reduce((a, b) => a + b, 0);

    const uniqueIds = new Set(dto.answers.map((a) => a.questionId));
    if (uniqueIds.size !== dto.answers.length) {
      throw new BadRequestException('Duplicate question answers submitted');
    }
    if (dto.answers.length < Math.min(expectedCount, bank.questions.length)) {
      throw new BadRequestException('সব প্রশ্নের উত্তর দিতে হবে!');
    }

    let correctCount = 0;
    let answerXp = 0;
    const wrongQuestionIds: string[] = [];
    const perDifficulty: Record<string, [number, number]> = {
      easy: [0, 0],
      medium: [0, 0],
      hard: [0, 0],
    };

    const results = dto.answers.map((answer) => {
      const question = questionById.get(answer.questionId);
      if (!question) {
        throw new BadRequestException(`Unknown question: ${answer.questionId}`);
      }
      const correct = question.answerIndex === answer.answerIndex;
      perDifficulty[question.difficulty][1] += 1;
      if (correct) {
        correctCount += 1;
        perDifficulty[question.difficulty][0] += 1;
        answerXp += XP_PER_CORRECT[question.difficulty];
      } else {
        wrongQuestionIds.push(question.id);
      }
      return {
        questionId: question.id,
        yourAnswerIndex: answer.answerIndex,
        correctIndex: question.answerIndex,
        correct,
        explanation: question.explanation,
      };
    });

    const score = Math.round((correctCount / dto.answers.length) * 100);
    const passed = score >= passPercent;
    const isFirstCompletion = status === 'current';
    const isPerfect = correctCount === dto.answers.length;

    let xpEarned = 0;
    if (passed && isFirstCompletion) {
      xpEarned =
        answerXp +
        (isBoss ? XP_BOSS_COMPLETE : XP_LESSON_COMPLETE) +
        (isPerfect ? XP_PERFECT_BONUS : 0);
      await this.progressService.completeLesson(
        lessonId,
        score,
        xpEarned,
        dto.timeSpentSec ?? 0,
      );
    }

    const attemptNo =
      (await this.quizAttemptModel.countDocuments({ lessonId }).exec()) + 1;
    await this.quizAttemptModel.create({
      lessonId,
      attemptNo,
      score,
      passed,
      wrongQuestionIds,
      perDifficulty,
      timeSpentSec: dto.timeSpentSec ?? 0,
    });

    return {
      lessonId,
      score,
      passPercent,
      passed,
      isFirstCompletion,
      xpEarned,
      correctCount,
      totalCount: dto.answers.length,
      perDifficulty,
      results,
    };
  }
}
