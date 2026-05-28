import type { DerivationStep } from "@/types";

/**
 * Generate synthetic attention visualization data from a derivation step.
 *
 * The attention matrix and tokens are generated deterministically from the
 * step content — producing educational demo data that feels connected to
 * the lesson rather than hardcoded magic constants.
 *
 * @returns `null` when the step has no attention animation type.
 */
export function deriveAttentionData(step: DerivationStep): {
  matrix: number[][];
  tokens: string[];
} | null {
  if (step.animation?.type !== "attention") return null;

  // Derive matrix size from step context: larger steps → more tokens
  const tokenCount = Math.min(Math.max(4, Math.ceil(step.explanation.length / 20)), 8);
  const tokens = generateTokens(step.title, tokenCount);

  // Build a diagonal-dominant attention matrix using a simple formula
  // that creates a realistic "attend-to-self" pattern
  const matrix: number[][] = [];
  for (let i = 0; i < tokenCount; i++) {
    const row: number[] = [];
    for (let j = 0; j < tokenCount; j++) {
      // Diagonal dominance: self-attention is strongest, decays with distance
      const dist = Math.abs(i - j);
      const raw = dist === 0 ? 1.0 : Math.max(0.01, 0.3 / (dist * 1.5));
      row.push(raw);
    }
    // Softmax normalization (approximate) to make each row sum ≈ 1
    const sum = row.reduce((a, b) => a + b, 0);
    for (let j = 0; j < tokenCount; j++) {
      row[j] = Math.round((row[j] / sum) * 100) / 100;
    }
    matrix.push(row);
  }

  return { matrix, tokens };
}

/**
 * Generate synthetic matrix visualization data from a derivation step.
 */
export function deriveMatrixData(step: DerivationStep): {
  matrix: number[][];
  caption: string;
} | null {
  if (step.animation?.type !== "matrix") return null;

  // Create a 2×2 or 3×3 matrix based on step context
  const size = step.explanation.length > 40 ? 3 : 2;
  const matrix: number[][] = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      row.push(i === j ? i + 1 : (i + 1) * (j + 1));
    }
    matrix.push(row);
  }

  return { matrix, caption: step.title };
}

/**
 * Generate synthetic gradient flow data from a derivation step.
 */
export function deriveGradientData(step: DerivationStep): {
  layers: { name: string; neurons: number; gradient: number[] }[];
} | null {
  if (step.animation?.type !== "gradient") return null;

  const layerNames = ["输入层", "隐藏层1", "隐藏层2", "输出层"];
  const layerSizes = [5, 4, 3, 2];
  const layers = layerNames.map((name, i) => {
    const neurons = layerSizes[i];
    const gradient: number[] = [];
    for (let n = 0; n < neurons; n++) {
      // Gradients tend to shrink or grow as they backpropagate
      const magnitude = 0.5 / (i + 1);
      const sign = n % 2 === 0 ? 1 : -1;
      gradient.push(sign * magnitude * (1 + Math.sin(n) * 0.3));
    }
    return { name, neurons, gradient };
  });

  return { layers };
}

/**
 * Derive video animation metadata from a derivation step.
 *
 * Returns the configured video path and a caption derived from the step title.
 *
 * @returns `null` when the step has no video animation type.
 */
export function deriveVideoData(step: DerivationStep): {
  videoPath: string;
  caption: string;
} | null {
  if (step.animation?.type !== "video") return null;
  return {
    videoPath: step.animation.videoPath ?? "",
    caption: step.title,
  };
}

// ── Private helpers ──────────────────────────────────────────

function generateTokens(title: string, count: number): string[] {
  // Extract meaningful tokens from the step title, padding if needed
  const words = title
    .replace(/[^\u4e00-\u9fff\w]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= count) return words.slice(0, count);

  // Pad with generic tokens
  const padding = ["Q", "K", "V", "注意力", "权重", "输出", "Softmax", "缩放"];
  const padded = [...words];
  while (padded.length < count) {
    padded.push(padding[padded.length % padding.length]);
  }
  return padded.slice(0, count);
}
