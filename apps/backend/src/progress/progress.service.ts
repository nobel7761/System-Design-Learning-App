import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import {
  LessonProgress,
  LessonProgressDocument,
} from './schemas/lesson-progress.schema';
import { SessionLog, SessionLogDocument } from './schemas/session-log.schema';
import { Streak, StreakDocument } from './schemas/streak.schema';

const STREAK_KEY = 'me';
const WEEKLY_GOAL = 4;

const LEVELS: { xp: number; title: string }[] = [
  { xp: 0, title: 'Intern' },
  { xp: 300, title: 'Junior Engineer' },
  { xp: 800, title: 'Engineer' },
  { xp: 1600, title: 'Senior Engineer' },
  { xp: 2800, title: 'Staff Engineer' },
  { xp: 4500, title: 'Principal Engineer' },
  { xp: 7000, title: 'Distinguished Architect' },
];

export type LessonStatus = 'done' | 'current' | 'locked';

@Injectable()
export class ProgressService {
  private readonly timeZone: string;

  constructor(
    private readonly curriculumService: CurriculumService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @InjectModel(LessonProgress.name)
    private readonly lessonProgressModel: Model<LessonProgressDocument>,
    @InjectModel(SessionLog.name)
    private readonly sessionLogModel: Model<SessionLogDocument>,
    @InjectModel(Streak.name)
    private readonly streakModel: Model<StreakDocument>,
  ) {
    this.timeZone = this.configService.get<string>(
      'APP_TIMEZONE',
      'Asia/Dhaka',
    );
  }

  /** Local date as YYYY-MM-DD in the configured study timezone */
  localDateStr(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: this.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  private addDays(dateStr: string, days: number): string {
    const d = new Date(`${dateStr}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  async getDoneLessonIds(): Promise<Set<string>> {
    const docs = await this.lessonProgressModel
      .find()
      .select('lessonId bestScore')
      .lean()
      .exec();
    return new Set(docs.map((d) => d.lessonId));
  }

  /** The first lesson in course order that is not done = today's lesson */
  async getCurrentLessonId(): Promise<string | null> {
    const done = await this.getDoneLessonIds();
    const ordered = this.curriculumService.getOrderedLessonIds();
    return ordered.find((id) => !done.has(id)) ?? null;
  }

  async getLessonStatus(lessonId: string): Promise<LessonStatus> {
    const done = await this.getDoneLessonIds();
    if (done.has(lessonId)) {
      return 'done';
    }
    const currentId = this.curriculumService
      .getOrderedLessonIds()
      .find((id) => !done.has(id));
    return lessonId === currentId ? 'current' : 'locked';
  }

  async completeLesson(
    lessonId: string,
    score: number,
    xpEarned: number,
    timeSpentSec: number,
  ): Promise<void> {
    const now = new Date();
    const today = this.localDateStr(now);

    const existing = await this.lessonProgressModel
      .findOne({ lessonId })
      .exec();
    if (existing) {
      if (score > existing.bestScore) {
        existing.bestScore = score;
        await existing.save();
      }
    } else {
      await this.lessonProgressModel.create({
        lessonId,
        status: 'done',
        bestScore: score,
        completedAt: now,
        timeSpentSec,
      });
    }

    await this.sessionLogModel.create({
      date: today,
      lessonId,
      xpEarned,
      timeSpentSec,
    });

    await this.updateStreak(today);
  }

  private async updateStreak(today: string): Promise<void> {
    let streak = await this.streakModel.findOne({ key: STREAK_KEY }).exec();
    if (!streak) {
      streak = new this.streakModel({ key: STREAK_KEY });
    }

    if (streak.lastStudyDate === today) {
      return; // already counted today
    }

    const yesterday = this.addDays(today, -1);
    streak.currentCount =
      streak.lastStudyDate === yesterday ? streak.currentCount + 1 : 1;
    streak.longestCount = Math.max(streak.longestCount, streak.currentCount);
    streak.lastStudyDate = today;
    await streak.save();
  }

  private levelFromXp(totalXp: number) {
    let level = 1;
    let title = LEVELS[0].title;
    for (let i = 0; i < LEVELS.length; i++) {
      if (totalXp >= LEVELS[i].xp) {
        level = i + 1;
        title = LEVELS[i].title;
      }
    }
    const next = LEVELS[level] ?? null;
    return {
      level,
      title,
      nextLevelXp: next ? next.xp : null,
    };
  }

  async getSyllabus() {
    const done = await this.getDoneLessonIds();
    const scores = await this.lessonProgressModel
      .find()
      .select('lessonId bestScore')
      .lean()
      .exec();
    const scoreByLesson = new Map(scores.map((s) => [s.lessonId, s.bestScore]));
    const currentId = this.curriculumService
      .getOrderedLessonIds()
      .find((id) => !done.has(id));

    return this.curriculumService.getWorlds().map((world) => {
      const lessons = world.lessons.map((lesson) => ({
        ...lesson,
        status: (done.has(lesson.id)
          ? 'done'
          : lesson.id === currentId
            ? 'current'
            : 'locked') as LessonStatus,
        bestScore: scoreByLesson.get(lesson.id) ?? null,
      }));
      const doneCount = lessons.filter((l) => l.status === 'done').length;
      return {
        id: world.id,
        order: world.order,
        title: world.title,
        titleEn: world.titleEn,
        description: world.description,
        doneCount,
        totalCount: lessons.length,
        percent: Math.round((doneCount / lessons.length) * 100),
        lessons,
      };
    });
  }

  async getDashboard(userId: string) {
    const [syllabus, streak, xpAgg, loginStats] = await Promise.all([
      this.getSyllabus(),
      this.streakModel.findOne({ key: STREAK_KEY }).lean().exec(),
      this.sessionLogModel
        .aggregate<{ _id: null; totalXp: number; totalTimeSec: number }>([
          {
            $group: {
              _id: null,
              totalXp: { $sum: '$xpEarned' },
              totalTimeSec: { $sum: '$timeSpentSec' },
            },
          },
        ])
        .exec(),
      this.authService.getLoginStats(userId),
    ]);

    const totalXp = xpAgg[0]?.totalXp ?? 0;
    const totalTimeSec = xpAgg[0]?.totalTimeSec ?? 0;

    // Current week (Mon..Sun) study map
    const today = this.localDateStr();
    const todayDate = new Date(`${today}T12:00:00Z`);
    const dayOfWeek = (todayDate.getUTCDay() + 6) % 7; // 0 = Monday
    const monday = this.addDays(today, -dayOfWeek);
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      this.addDays(monday, i),
    );
    const weekLogs = await this.sessionLogModel
      .find({ date: { $in: weekDates } })
      .select('date')
      .lean()
      .exec();
    const studiedDates = new Set(weekLogs.map((l) => l.date));
    const week = weekDates.map((date) => ({
      date,
      studied: studiedDates.has(date),
      isToday: date === today,
    }));

    // Today's lesson = first non-done in course order
    let todayLesson: Record<string, unknown> | null = null;
    for (const world of syllabus) {
      const current = world.lessons.find((l) => l.status === 'current');
      if (current) {
        todayLesson = {
          ...current,
          worldId: world.id,
          worldTitle: world.title,
          worldTitleEn: world.titleEn,
        };
        break;
      }
    }

    const totalLessons = this.curriculumService.getTotalLessonCount();
    const doneLessons = syllabus.reduce((acc, w) => acc + w.doneCount, 0);

    return {
      todayLesson,
      streak: {
        current: streak?.currentCount ?? 0,
        longest: streak?.longestCount ?? 0,
        freezeTokens: streak?.freezeTokens ?? 0,
        studiedToday: streak?.lastStudyDate === today,
      },
      xp: { total: totalXp, ...this.levelFromXp(totalXp) },
      week: {
        days: week,
        studiedCount: studiedDates.size,
        goal: WEEKLY_GOAL,
      },
      totals: {
        doneLessons,
        totalLessons,
        percent: Math.round((doneLessons / totalLessons) * 100),
        totalTimeSec,
      },
      worlds: syllabus.map((w) => ({
        id: w.id,
        order: w.order,
        title: w.title,
        titleEn: w.titleEn,
        description: w.description,
        doneCount: w.doneCount,
        totalCount: w.totalCount,
        percent: w.percent,
      })),
      activity: loginStats,
    };
  }
}
