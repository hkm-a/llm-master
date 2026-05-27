export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface UserProgress {
  currentChapter: string;
  completedLessons: string[];
  lessonProgress: Record<string, LessonProgress>;
  totalProgress: number;
  lastVisited: string;
  [key: string]: unknown;
}

export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  derivationStepsViewed: number[];
  sandboxCompleted: boolean;
  timeSpent: number;
}

export interface AnimationConfig {
  type: "matrix" | "gradient" | "attention" | "video";
  videoPath?: string;
  interactiveConfig?: Record<string, unknown>;
}

export interface DerivationStep {
  stepNumber: number;
  title: string;
  formula: string;
  explanation: string;
  animation?: AnimationConfig;
}

export interface ChapterResource {
  papers: string[];
  blogs: string[];
  github: string[];
  books: string[];
}