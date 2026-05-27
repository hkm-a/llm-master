import { expect, test, describe } from "vitest";
import { chapters } from "./chapters";

describe("chapters data", () => {
  test("should have correct number of chapters", () => {
    expect(chapters.length).toBeGreaterThan(0);
    expect(chapters.length).toBe(9);
  });

  test("each chapter should have required fields", () => {
    chapters.forEach((chapter) => {
      expect(chapter).toHaveProperty("id");
      expect(chapter).toHaveProperty("order");
      expect(chapter).toHaveProperty("title");
      expect(chapter).toHaveProperty("description");
      expect(chapter).toHaveProperty("phase");
      expect(chapter).toHaveProperty("lessons");
      expect(Array.isArray(chapter.lessons)).toBe(true);
    });
  });

  test("each lesson should have required fields", () => {
    chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        expect(lesson).toHaveProperty("id");
        expect(lesson).toHaveProperty("order");
        expect(lesson).toHaveProperty("title");
        expect(lesson).toHaveProperty("description");
        expect(lesson).toHaveProperty("difficulty");
      });
    });
  });

  test("should have correct phases", () => {
    const phases = chapters.map((c) => c.phase);
    expect(phases.includes("Phase 1: 基础")).toBe(true);
    expect(phases.includes("Phase 2: 核心架构")).toBe(true);
    expect(phases.includes("Phase 3: 工程实践")).toBe(true);
  });
});
