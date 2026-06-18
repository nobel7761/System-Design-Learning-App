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
    if (done.has(lessonId)) return 'done';
    const track = this.curriculumService.getLessonTrack(lessonId);
    const currentId = this.curriculumService
      .getOrderedLessonIdsByTrack(track)
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

    streak.lastStudyDate = today;

    // Compute this week's Monday
    const todayDate = new Date(`${today}T12:00:00Z`);
    const dayOfWeek = (todayDate.getUTCDay() + 6) % 7; // 0 = Monday
    const thisWeekMonday = this.addDays(today, -dayOfWeek);

    // Count unique study days this week
    const thisWeekDates = Array.from({ length: 7 }, (_, i) =>
      this.addDays(thisWeekMonday, i),
    );
    const thisWeekLogs = await this.sessionLogModel
      .find({ date: { $in: thisWeekDates } })
      .select('date')
      .lean()
      .exec();
    const uniqueStudyDays = new Set(thisWeekLogs.map((l) => l.date)).size;

    // Once per week: if we hit the goal and haven't already recorded this week
    if (
      uniqueStudyDays >= WEEKLY_GOAL &&
      streak.lastStreakWeek !== thisWeekMonday
    ) {
      const prevWeekMonday = this.addDays(thisWeekMonday, -7);
      const isConsecutive = streak.lastStreakWeek === prevWeekMonday;
      streak.currentCount = isConsecutive ? streak.currentCount + 1 : 1;
      streak.longestCount = Math.max(streak.longestCount, streak.currentCount);
      streak.lastStreakWeek = thisWeekMonday;
    }

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

    // Per-track current lesson (each track has independent locking)
    const trackCurrentId = new Map<string, string | undefined>();
    for (const track of ['system-design', 'docker', 'ai-mastery'] as const) {
      const currentId = this.curriculumService
        .getOrderedLessonIdsByTrack(track)
        .find((id) => !done.has(id));
      trackCurrentId.set(track, currentId);
    }

    return this.curriculumService.getWorlds().map((world) => {
      const currentId = trackCurrentId.get(world.track);
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
        track: world.track,
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
    const [syllabus, streak, allLogs, loginStats] = await Promise.all([
      this.getSyllabus(),
      this.streakModel.findOne({ key: STREAK_KEY }).lean().exec(),
      this.sessionLogModel
        .find()
        .select('lessonId xpEarned timeSpentSec date')
        .lean()
        .exec(),
      this.authService.getLoginStats(userId),
    ]);

    const totalXp = allLogs.reduce((a, l) => a + l.xpEarned, 0);
    const totalTimeSec = allLogs.reduce((a, l) => a + l.timeSpentSec, 0);

    // Current week (Mon..Sun) study map
    const today = this.localDateStr();
    const todayDate = new Date(`${today}T12:00:00Z`);
    const dayOfWeek = (todayDate.getUTCDay() + 6) % 7; // 0 = Monday
    const monday = this.addDays(today, -dayOfWeek);
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      this.addDays(monday, i),
    );
    const studiedDates = new Set(
      allLogs.filter((l) => weekDates.includes(l.date)).map((l) => l.date),
    );
    const week = weekDates.map((date) => ({
      date,
      studied: studiedDates.has(date),
      isToday: date === today,
    }));

    // Per-track current lesson and progress
    const buildTrackSummary = (
      track: 'system-design' | 'docker' | 'ai-mastery',
    ) => {
      const trackWorlds = syllabus.filter((w) => w.track === track);
      const trackLessonIds = new Set(
        trackWorlds.flatMap((w) => w.lessons.map((l) => l.id)),
      );
      const done = trackWorlds.reduce((a, w) => a + w.doneCount, 0);
      const total = trackWorlds.reduce((a, w) => a + w.totalCount, 0);

      const trackLogs = allLogs.filter((l) => trackLessonIds.has(l.lessonId));
      const xpEarned = trackLogs.reduce((a, l) => a + l.xpEarned, 0);
      const trackTimeSec = trackLogs.reduce((a, l) => a + l.timeSpentSec, 0);
      const sessionsThisWeek = trackLogs.filter((l) =>
        weekDates.includes(l.date),
      ).length;

      let currentLesson: Record<string, unknown> | null = null;
      for (const world of trackWorlds) {
        const cur = world.lessons.find((l) => l.status === 'current');
        if (cur) {
          currentLesson = {
            ...cur,
            worldId: world.id,
            worldTitle: world.title,
            worldTitleEn: world.titleEn,
          };
          break;
        }
      }

      const weekDays = weekDates.map((date) => ({
        date,
        studied: trackLogs.some((l) => l.date === date),
        isToday: date === today,
      }));

      const worlds = trackWorlds.map((w) => ({
        id: w.id,
        title: w.title,
        doneCount: w.doneCount,
        totalCount: w.totalCount,
        percent: w.percent,
      }));

      return {
        done,
        total,
        percent: total ? Math.round((done / total) * 100) : 0,
        xpEarned,
        totalTimeSec: trackTimeSec,
        sessionsThisWeek,
        currentLesson,
        weekDays,
        worlds,
      };
    };

    const totalLessons = this.curriculumService.getTotalLessonCount();
    const doneLessons = syllabus.reduce((acc, w) => acc + w.doneCount, 0);

    return {
      tracks: {
        'system-design': buildTrackSummary('system-design'),
        docker: buildTrackSummary('docker'),
        'ai-mastery': buildTrackSummary('ai-mastery'),
      },
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
