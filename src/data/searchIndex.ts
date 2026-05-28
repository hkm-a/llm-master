import { chapters } from "@/lib/content/chapters";
import { lessonContent } from "@/lib/content/lessons";

export interface SearchEntry {
  id: string;
  title: string;
  description: string;
  bodyText: string;
  derivationTitles: string[];
  derivationExplanations: string[];
  phase: string;
  chapterTitle: string;
  chapterId: string;
  type: "lesson";
}

const searchIndex: SearchEntry[] = chapters.flatMap((ch) =>
  ch.lessons.map((lesson) => {
    const content = lessonContent[lesson.id];
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      bodyText: content?.bodyText ?? "",
      derivationTitles: content?.derivationSteps.map((s) => s.title) ?? [],
      derivationExplanations: content?.derivationSteps.map((s) => s.explanation) ?? [],
      phase: ch.phase,
      chapterTitle: ch.title,
      chapterId: ch.id,
      type: "lesson" as const,
    };
  })
);

/**
 * Search the index for entries matching the given query.
 * Performs case-insensitive substring matching on title, description,
 * bodyText, derivation titles, and derivation explanations.
 */
export function searchLessons(query: string): SearchEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return searchIndex.filter((entry) => {
    const title = entry.title.toLowerCase();
    const desc = entry.description.toLowerCase();
    const body = entry.bodyText.toLowerCase();
    const chapter = entry.chapterTitle.toLowerCase();
    const phase = entry.phase.toLowerCase();
    const derivationTitles = entry.derivationTitles.some((t) =>
      t.toLowerCase().includes(q)
    );
    const derivationExplanations = entry.derivationExplanations.some((e) =>
      e.toLowerCase().includes(q)
    );
    return (
      title.includes(q) ||
      desc.includes(q) ||
      body.includes(q) ||
      chapter.includes(q) ||
      phase.includes(q) ||
      derivationTitles ||
      derivationExplanations
    );
  });
}

/** All lessons flattened — for quick lookup or rendering. */
export const allLessonsIndex = searchIndex;
