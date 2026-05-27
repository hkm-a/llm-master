import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chapters } from "@/lib/content/chapters";
import type { LessonStatus } from "@/types";

interface ProgressStore {
  progress: Record<string, LessonStatus>;
  updateLessonProgress: (lessonId: string, status: LessonStatus) => void;
  resetProgress: () => void;
}

const initialProgress: Record<string, LessonStatus> = {};
chapters.forEach((chapter) => {
  chapter.lessons.forEach((lesson) => {
    initialProgress[lesson.id] = "not_started";
  });
});

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      progress: initialProgress,

      updateLessonProgress: (lessonId, status) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [lessonId]: status,
          },
        })),

      resetProgress: () =>
        set(() => ({
          progress: initialProgress,
        })),
    }),
    {
      name: "llm-master-progress",
    }
  )
);

// ─── Computed Selectors ────────────────────────────────────────
// Using `useProgressStore(s => s.progress)` only re-renders when progress changes.

export function useCompletedCount(): number {
  const progress = useProgressStore((s) => s.progress);
  return Object.values(progress).filter((p) => p === "completed").length;
}

export function useInProgressCount(): number {
  const progress = useProgressStore((s) => s.progress);
  return Object.values(progress).filter((p) => p === "in_progress").length;
}

export function useProgressPercent(): number {
  const progress = useProgressStore((s) => s.progress);
  const allLessons = Object.keys(progress);
  const completed = allLessons.filter(
    (id) => progress[id] === "completed"
  ).length;
  const total = allLessons.length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function useTotalCount(): number {
  return Object.keys(useProgressStore((s) => s.progress)).length;
}

export function useLessonStatus(id: string): LessonStatus {
  return useProgressStore((s) => s.progress[id] ?? "not_started");
}

export function useChapterCompletedCount(chapterId: string): number {
  const progress = useProgressStore((s) => s.progress);
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) return 0;
  return chapter.lessons.filter((l) => progress[l.id] === "completed").length;
}

export function useChapterProgressPercent(chapterId: string): number {
  const progress = useProgressStore((s) => s.progress);
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter || chapter.lessons.length === 0) return 0;
  const completed = chapter.lessons.filter(
    (l) => progress[l.id] === "completed"
  ).length;
  return Math.round((completed / chapter.lessons.length) * 100);
}

/** Legacy helper for backward compatibility — prefer individual selectors. */
export function calculateTotalProgress(progress: Record<string, LessonStatus>): number {
  const allLessons = Object.keys(progress);
  const completed = allLessons.filter(
    (id) => progress[id] === "completed"
  ).length;
  const total = allLessons.length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
