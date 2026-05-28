import { expect, test, describe } from "vitest";
import { lessonContent, getLessonContent } from "./lessons";
import { chapters } from "./chapters";

describe("lesson content registry", () => {
  test("should have entries for all lessons across chapters", () => {
    const allLessonIds = chapters.flatMap((ch) => ch.lessons.map((l) => l.id));
    expect(allLessonIds.length).toBeGreaterThan(0);

    allLessonIds.forEach((id) => {
      expect(lessonContent[id]).toBeDefined();
    });
  });

  test("each lesson content should have required fields", () => {
    const entries = Object.values(lessonContent);
    entries.forEach((entry) => {
      expect(entry).toBeDefined();
      if (!entry) return;
      expect(Array.isArray(entry.derivationSteps)).toBe(true);
      expect(typeof entry.bodyText).toBe("string");
      expect(entry.bodyText.length).toBeGreaterThan(0);
      expect(entry.backLink).toHaveProperty("chapterId");
      expect(entry.backLink).toHaveProperty("chapterTitle");
      expect(typeof entry.backLink.chapterId).toBe("string");
      expect(typeof entry.backLink.chapterTitle).toBe("string");
    });
  });

  test("each derivation step should have required fields", () => {
    const entries = Object.values(lessonContent);
    entries.forEach((entry) => {
      if (!entry) return;
      entry.derivationSteps.forEach((step) => {
        expect(step).toHaveProperty("stepNumber");
        expect(typeof step.stepNumber).toBe("number");
        expect(step.stepNumber).toBeGreaterThan(0);
        expect(typeof step.title).toBe("string");
        expect(step.title.length).toBeGreaterThan(0);
        expect(typeof step.formula).toBe("string");
        expect(step.formula.length).toBeGreaterThan(0);
        expect(typeof step.explanation).toBe("string");
        expect(step.explanation.length).toBeGreaterThan(0);
      });
    });
  });

  test("each derivation step should have sequential step numbers starting from 1", () => {
    const entries = Object.values(lessonContent);
    entries.forEach((entry) => {
      if (!entry) return;
      entry.derivationSteps.forEach((step, index) => {
        expect(step.stepNumber).toBe(index + 1);
      });
    });
  });

  test("getLessonContent should return correct content by id", () => {
    const chapterLessonIds = chapters.flatMap((ch) =>
      ch.lessons.map((l) => l.id)
    );
    const sampleIds = chapterLessonIds.slice(0, 3);

    sampleIds.forEach((id) => {
      const content = getLessonContent(id);
      expect(content).toBeDefined();
      expect(content?.backLink.chapterId).toBe(id.split("_")[0]);
    });
  });

  test("getLessonContent should return undefined for unknown id", () => {
    const content = getLessonContent("nonexistent");
    expect(content).toBeUndefined();
  });

  test("lesson count should match chapters totalLessons", () => {
    const allLessonIds = chapters.flatMap((ch) => ch.lessons.map((l) => l.id));
    const registeredCount = Object.keys(lessonContent).length;
    expect(registeredCount).toBe(allLessonIds.length);
  });
});
