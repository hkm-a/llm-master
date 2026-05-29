import { describe, it, expect } from "vitest";
import { searchLessons, allLessonsIndex } from "./searchIndex";

describe("searchIndex", () => {
  describe("allLessonsIndex", () => {
    it("contains all lessons from chapters", () => {
      expect(allLessonsIndex.length).toBeGreaterThan(0);
    });

    it("each entry has required fields", () => {
      allLessonsIndex.forEach((entry) => {
        expect(entry.id).toBeDefined();
        expect(entry.title).toBeDefined();
        expect(entry.description).toBeDefined();
        expect(entry.type).toBe("lesson");
        expect(entry.chapterId).toBeDefined();
        expect(entry.phase).toBeDefined();
      });
    });
  });

  describe("searchLessons", () => {
    it("returns empty array for empty query", () => {
      expect(searchLessons("")).toEqual([]);
    });

    it("returns empty array for whitespace-only query", () => {
      expect(searchLessons("   ")).toEqual([]);
    });

    it("finds lessons by title", () => {
      const results = searchLessons("注意力");
      expect(results.length).toBeGreaterThan(0);
      // At least one result should have "注意力" in title, description, or body
      const hasMatch = results.some(
        (r) =>
          r.title.includes("注意力") ||
          r.description.includes("注意力") ||
          r.bodyText.includes("注意力")
      );
      expect(hasMatch).toBe(true);
    });

    it("finds lessons by description", () => {
      const results = searchLessons("Transformer");
      expect(results.length).toBeGreaterThan(0);
    });

    it("finds lessons by chapter title", () => {
      const results = searchLessons("数学基础");
      expect(results.length).toBeGreaterThan(0);
    });

    it("is case insensitive", () => {
      const lower = searchLessons("attention");
      const upper = searchLessons("ATTENTION");
      expect(lower.length).toBe(upper.length);
    });

    it("finds lessons by derivation title", () => {
      const results = searchLessons("缩放");
      expect(results.length).toBeGreaterThan(0);
    });

    it("returns multiple results for common terms", () => {
      const results = searchLessons("模型");
      expect(results.length).toBeGreaterThan(1);
    });
  });
});
