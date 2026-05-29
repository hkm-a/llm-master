import { describe, it, expect } from "vitest";
import {
  deriveAttentionData,
  deriveMatrixData,
  deriveGradientData,
  deriveVideoData,
} from "./visualization";
import type { DerivationStep } from "@/types";

describe("visualization utils", () => {
  const baseStep: DerivationStep = {
    stepNumber: 1,
    title: "Test Step",
    formula: "E = mc^2",
    explanation:
      "This is a test explanation with enough content to trigger larger matrix generation.",
  };

  describe("deriveAttentionData", () => {
    it("returns null for non-attention animation", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "matrix" },
      };
      expect(deriveAttentionData(step)).toBeNull();
    });

    it("returns null when no animation", () => {
      expect(deriveAttentionData(baseStep)).toBeNull();
    });

    it("returns attention data for attention animation type", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "attention" },
      };
      const result = deriveAttentionData(step);
      expect(result).not.toBeNull();
      expect(result?.matrix).toBeDefined();
      expect(result?.tokens).toBeDefined();
      expect(result?.matrix.length).toBeGreaterThan(0);
      expect(result?.tokens.length).toBeGreaterThan(0);
    });

    it("generates square matrix", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "attention" },
      };
      const result = deriveAttentionData(step);
      expect(result).not.toBeNull();
      const size = result?.matrix.length ?? 0;
      result?.matrix.forEach((row) => {
        expect(row.length).toBe(size);
      });
    });

    it("matrix rows sum to approximately 1", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "attention" },
      };
      const result = deriveAttentionData(step);
      expect(result).not.toBeNull();
      result?.matrix.forEach((row) => {
        const sum = row.reduce((a, b) => a + b, 0);
        expect(sum).toBeCloseTo(1.0, 1);
      });
    });
  });

  describe("deriveMatrixData", () => {
    it("returns null for non-matrix animation", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "attention" },
      };
      expect(deriveMatrixData(step)).toBeNull();
    });

    it("returns null when no animation", () => {
      expect(deriveMatrixData(baseStep)).toBeNull();
    });

    it("returns matrix data for matrix animation type", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "matrix" },
      };
      const result = deriveMatrixData(step);
      expect(result).not.toBeNull();
      expect(result?.matrix).toBeDefined();
      expect(result?.caption).toBe(step.title);
    });

    it("generates 2x2 matrix for short explanation", () => {
      const step: DerivationStep = {
        ...baseStep,
        explanation: "Short",
        animation: { type: "matrix" },
      };
      const result = deriveMatrixData(step);
      expect(result?.matrix.length).toBe(2);
      expect(result?.matrix[0].length).toBe(2);
    });

    it("generates 3x3 matrix for long explanation", () => {
      const step: DerivationStep = {
        ...baseStep,
        explanation:
          "This is a much longer explanation that should trigger the 3x3 matrix generation.",
        animation: { type: "matrix" },
      };
      const result = deriveMatrixData(step);
      expect(result?.matrix.length).toBe(3);
      expect(result?.matrix[0].length).toBe(3);
    });
  });

  describe("deriveGradientData", () => {
    it("returns null for non-gradient animation", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "matrix" },
      };
      expect(deriveGradientData(step)).toBeNull();
    });

    it("returns null when no animation", () => {
      expect(deriveGradientData(baseStep)).toBeNull();
    });

    it("returns gradient data for gradient animation type", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "gradient" },
      };
      const result = deriveGradientData(step);
      expect(result).not.toBeNull();
      expect(result?.layers).toBeDefined();
      expect(result?.layers.length).toBe(4);
    });

    it("generates layers with correct structure", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "gradient" },
      };
      const result = deriveGradientData(step);
      result?.layers.forEach((layer) => {
        expect(layer.name).toBeDefined();
        expect(layer.neurons).toBeGreaterThan(0);
        expect(layer.gradient.length).toBe(layer.neurons);
      });
    });
  });

  describe("deriveVideoData", () => {
    it("returns null for non-video animation", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "matrix" },
      };
      expect(deriveVideoData(step)).toBeNull();
    });

    it("returns null when no animation", () => {
      expect(deriveVideoData(baseStep)).toBeNull();
    });

    it("returns video data for video animation type", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "video", videoPath: "/videos/test.mp4" },
      };
      const result = deriveVideoData(step);
      expect(result).not.toBeNull();
      expect(result?.videoPath).toBe("/videos/test.mp4");
      expect(result?.caption).toBe(step.title);
    });

    it("returns empty string for missing videoPath", () => {
      const step: DerivationStep = {
        ...baseStep,
        animation: { type: "video" },
      };
      const result = deriveVideoData(step);
      expect(result?.videoPath).toBe("");
    });
  });
});
