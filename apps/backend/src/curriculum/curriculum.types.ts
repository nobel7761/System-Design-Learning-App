export type LessonType =
  | 'lesson'
  | 'boss'
  | 'dojo'
  | 'mock'
  | 'workshop'
  | 'deep-dive'
  | 'project';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface LessonDef {
  id: string;
  order: number;
  title: string;
  titleEn: string;
  type: LessonType;
  estMinutes: number;
  contentReady: boolean;
}

export type Track =
  | 'system-design'
  | 'docker'
  | 'ai-mastery'
  | 'dsa'
  | 'devops';

export interface WorldDef {
  id: string;
  order: number;
  track: Track;
  title: string;
  titleEn: string;
  description: string;
  lessons: LessonDef[];
}

export interface QuizQuestion {
  id: string;
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface QuizBank {
  lessonId: string;
  questions: QuizQuestion[];
  /** Overrides the default lesson pass percent (e.g. 95 for lab exams) */
  passPercent?: number;
  /** Overrides the default per-difficulty sample size for the lesson quiz */
  sample?: Record<QuizDifficulty, number>;
}

/** A question as served to the client — no answer, no explanation */
export type ServedQuestion = Omit<QuizQuestion, 'answerIndex' | 'explanation'>;
