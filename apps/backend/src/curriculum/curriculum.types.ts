export type LessonType = 'lesson' | 'boss' | 'dojo' | 'mock';

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

export interface WorldDef {
  id: string;
  order: number;
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
}

/** A question as served to the client — no answer, no explanation */
export type ServedQuestion = Omit<QuizQuestion, 'answerIndex' | 'explanation'>;
