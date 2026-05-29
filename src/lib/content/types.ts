import type { ChapterResource } from "@/types";

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  phase: "Phase 1: 基础" | "Phase 2: 核心架构" | "Phase 3: 工程实践";
  lessons: Lesson[];
  resources: ChapterResource;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  difficulty: "easy" | "medium" | "hard";
}

/** 一个子概念：独立一页，有详细讲解 + 公式 + 动画 */
export interface Concept {
  id: string;
  title: string;
  /** 详细讲解文字，可以很长 */
  explanation: string;
  /** 数学公式（LaTeX） */
  formula?: string;
  /** 动画视频路径 */
  animation?: string;
}

/** 交互式测验题目 */
export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ContentIndex {
  chapters: Chapter[];
  totalLessons: number;
}
