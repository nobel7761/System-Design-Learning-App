import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { LessonDef, QuizBank, Track, WorldDef } from './curriculum.types';

/**
 * Loads the static curriculum definition (worlds/lessons) and quiz banks
 * from JSON files bundled with the app. These files are the source of
 * truth for ordering and locking; Mongo only stores user state.
 */
@Injectable()
export class CurriculumService implements OnModuleInit {
  private worlds: WorldDef[] = [];
  private lessonsById = new Map<string, LessonDef>();
  private worldIdByLessonId = new Map<string, string>();
  private orderedLessonIds: string[] = [];
  private quizBanks = new Map<string, QuizBank>();

  onModuleInit() {
    this.loadCurriculum();
  }

  private dataDir(): string {
    // Works from both src (ts-node/jest) and dist (nest build copies assets)
    const candidates = [
      join(__dirname, 'data'),
      join(process.cwd(), 'src', 'curriculum', 'data'),
      join(process.cwd(), 'apps', 'backend', 'src', 'curriculum', 'data'),
    ];
    const found = candidates.find((dir) => existsSync(dir));
    if (!found) {
      throw new Error(
        `Curriculum data directory not found. Tried: ${candidates.join(', ')}`,
      );
    }
    return found;
  }

  private loadCurriculum() {
    const dir = this.dataDir();
    this.worlds = JSON.parse(
      readFileSync(join(dir, 'worlds.json'), 'utf-8'),
    ) as WorldDef[];
    this.worlds.sort((a, b) => a.order - b.order);

    for (const world of this.worlds) {
      world.lessons.sort((a, b) => a.order - b.order);
      for (const lesson of world.lessons) {
        this.lessonsById.set(lesson.id, lesson);
        this.worldIdByLessonId.set(lesson.id, world.id);
        this.orderedLessonIds.push(lesson.id);
      }
    }
  }

  getWorlds(): WorldDef[] {
    return this.worlds;
  }

  getLesson(lessonId: string): LessonDef {
    const lesson = this.lessonsById.get(lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }
    return lesson;
  }

  getWorldIdForLesson(lessonId: string): string {
    const worldId = this.worldIdByLessonId.get(lessonId);
    if (!worldId) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }
    return worldId;
  }

  /** All lesson ids in strict course order (the linear path). */
  getOrderedLessonIds(): string[] {
    return this.orderedLessonIds;
  }

  /** Lesson ids for a specific track, in world+lesson order. */
  getOrderedLessonIdsByTrack(track: Track): string[] {
    const ids: string[] = [];
    for (const world of this.worlds) {
      if (world.track === track) {
        for (const lesson of world.lessons) {
          ids.push(lesson.id);
        }
      }
    }
    return ids;
  }

  getLessonTrack(lessonId: string): Track {
    const worldId = this.worldIdByLessonId.get(lessonId);
    const world = this.worlds.find((w) => w.id === worldId);
    return world?.track ?? 'system-design';
  }

  getTotalLessonCount(): number {
    return this.orderedLessonIds.length;
  }

  getTotalLessonCountByTrack(track: Track): number {
    return this.getOrderedLessonIdsByTrack(track).length;
  }

  getQuizBank(lessonId: string): QuizBank {
    // Lazy-load and cache each bank
    const cached = this.quizBanks.get(lessonId);
    if (cached) {
      return cached;
    }
    const path = join(this.dataDir(), 'quizzes', `${lessonId}.json`);
    if (!existsSync(path)) {
      throw new NotFoundException(`Quiz bank for lesson ${lessonId} not found`);
    }
    const bank = JSON.parse(readFileSync(path, 'utf-8')) as QuizBank;
    this.quizBanks.set(lessonId, bank);
    return bank;
  }
}
