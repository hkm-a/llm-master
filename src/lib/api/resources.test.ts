import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectResourceType, fetchResourceContent } from "./resources";

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("resources API", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("detectResourceType", () => {
    it("detects arxiv papers", () => {
      expect(detectResourceType("https://arxiv.org/abs/2301.00001")).toBe("paper");
      expect(detectResourceType("https://arxiv.org/pdf/2301.00001")).toBe("paper");
    });

    it("detects github repos", () => {
      expect(detectResourceType("https://github.com/user/repo")).toBe("github");
      expect(detectResourceType("https://github.com/org/project")).toBe("github");
    });

    it("detects blog posts as default", () => {
      expect(detectResourceType("https://example.com/article")).toBe("blog");
      expect(detectResourceType("https://blog.example.com/post")).toBe("blog");
      expect(detectResourceType("https://medium.com/article")).toBe("blog");
    });

    it("handles empty string", () => {
      expect(detectResourceType("")).toBe("blog");
    });
  });

  describe("fetchResourceContent", () => {
    it("returns cached content if available", async () => {
      const mockContent = {
        title: "Test",
        content: "Content",
        resource_type: "paper",
        url: "https://arxiv.org/abs/1234",
        language: "en",
        chinese_summary: null,
      };

      // Set cache
      localStorage.setItem(
        `llm-resource-cache-${btoa("https://arxiv.org/abs/1234")}`,
        JSON.stringify({ data: mockContent, timestamp: Date.now() })
      );

      const result = await fetchResourceContent("https://arxiv.org/abs/1234", "paper");
      expect(result).toEqual(mockContent);
    });

    it("returns null for expired cache", async () => {
      const mockContent = {
        title: "Test",
        content: "Content",
        resource_type: "paper",
        url: "https://arxiv.org/abs/1234",
        language: "en",
        chinese_summary: null,
      };

      // Set expired cache (25 hours ago)
      localStorage.setItem(
        `llm-resource-cache-${btoa("https://arxiv.org/abs/1234")}`,
        JSON.stringify({ data: mockContent, timestamp: Date.now() - 25 * 60 * 60 * 1000 })
      );

      const { invoke } = await import("@tauri-apps/api/core");
      vi.mocked(invoke).mockResolvedValue(mockContent);

      const result = await fetchResourceContent("https://arxiv.org/abs/1234", "paper");
      expect(result).toEqual(mockContent);
      expect(invoke).toHaveBeenCalled();
    });

    it("handles malformed cache gracefully", async () => {
      localStorage.setItem(
        `llm-resource-cache-${btoa("https://arxiv.org/abs/1234")}`,
        "invalid json"
      );

      const { invoke } = await import("@tauri-apps/api/core");
      const mockContent = {
        title: "Test",
        content: "Content",
        resource_type: "paper",
        url: "https://arxiv.org/abs/1234",
        language: "en",
        chinese_summary: null,
      };
      vi.mocked(invoke).mockResolvedValue(mockContent);

      const result = await fetchResourceContent("https://arxiv.org/abs/1234", "paper");
      expect(result).toEqual(mockContent);
    });
  });
});
