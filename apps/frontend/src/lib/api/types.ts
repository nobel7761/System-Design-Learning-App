export type LessonType =
  | "lesson"
  | "boss"
  | "dojo"
  | "mock"
  | "workshop"
  | "deep-dive"
  | "project";
export type LessonStatus = "done" | "current" | "locked";
export type QuizDifficulty = "easy" | "medium" | "hard";
export type Track = "system-design" | "docker" | "ai-mastery";

export interface LoginResponse {
  accessToken: string;
  user: { id: string; name: string; email: string };
}

export interface SyllabusLesson {
  id: string;
  order: number;
  title: string;
  titleEn: string;
  type: LessonType;
  estMinutes: number;
  contentReady: boolean;
  status: LessonStatus;
  bestScore: number | null;
}

export interface SyllabusWorld {
  id: string;
  order: number;
  track: Track;
  title: string;
  titleEn: string;
  description: string;
  doneCount: number;
  totalCount: number;
  percent: number;
  lessons: SyllabusLesson[];
}

export type DashboardWorld = Omit<SyllabusWorld, "lessons">;

export interface TrackCurrentLesson extends SyllabusLesson {
  worldId: string;
  worldTitle: string;
  worldTitleEn: string;
}

export interface TrackWeekDay {
  date: string;
  studied: boolean;
  isToday: boolean;
}

export interface TrackWorldMini {
  id: string;
  title: string;
  doneCount: number;
  totalCount: number;
  percent: number;
}

export interface TrackSummary {
  done: number;
  total: number;
  percent: number;
  xpEarned: number;
  totalTimeSec: number;
  sessionsThisWeek: number;
  currentLesson: TrackCurrentLesson | null;
  weekDays: TrackWeekDay[];
  worlds: TrackWorldMini[];
}

export interface Dashboard {
  tracks: {
    "system-design": TrackSummary;
    docker: TrackSummary;
    "ai-mastery": TrackSummary;
  };
  streak: {
    current: number;
    longest: number;
    freezeTokens: number;
    studiedToday: boolean;
  };
  xp: {
    total: number;
    level: number;
    title: string;
    nextLevelXp: number | null;
  };
  week: {
    days: { date: string; studied: boolean; isToday: boolean }[];
    studiedCount: number;
    goal: number;
  };
  totals: {
    doneLessons: number;
    totalLessons: number;
    percent: number;
    totalTimeSec: number;
  };
  worlds: DashboardWorld[];
  activity: { totalLogins: number; lastLoginAt: string | null };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatHistory {
  lessonId: string;
  messages: ChatMessage[];
}

export interface ServedQuestion {
  id: string;
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
}

export interface QuizPayload {
  lessonId: string;
  passPercent: number;
  questions: ServedQuestion[];
}

export interface QuizResultItem {
  questionId: string;
  yourAnswerIndex: number;
  correctIndex: number;
  correct: boolean;
  explanation: string;
}

export interface QuizResult {
  lessonId: string;
  score: number;
  passPercent: number;
  passed: boolean;
  isFirstCompletion: boolean;
  xpEarned: number;
  correctCount: number;
  totalCount: number;
  perDifficulty: Record<string, [number, number]>;
  results: QuizResultItem[];
}
