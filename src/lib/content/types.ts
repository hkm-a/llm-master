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

export interface ContentIndex {
  chapters: Chapter[];
  totalLessons: number;
}
