export type LessonStatus = "not_started" | "in_progress" | "completed";

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
