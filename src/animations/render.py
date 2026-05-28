#!/usr/bin/env python3
"""Batch render all Manim animation scenes to public/videos/."""

import subprocess
import sys
import os
from pathlib import Path

# ── Configuration ──────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
PUBLIC_VIDEOS = PROJECT_ROOT / "public" / "videos"
SCENES_DIR = PROJECT_ROOT / "src" / "animations" / "scenes"

# Quality preset: use -ql (low) for dev, -qh (high) for final render
QUALITY = "-ql"  # low quality for fast iteration; change to "-qh" for production

# Scene modules → list of scene classes to render
SCENE_MAP = {
    "attention_scene": [
        "ScaledDotProductAttention",
        # "MultiHeadAttention",
        # "AttentionMatrixFlow",
    ],
    "matrix_scene": [
        "MatrixMultiplication",
        # "MatrixTransform2D",
        # "EigenvalueVisualization",
    ],
    "gradient_scene": [
        "GradientDescent",
        # "LossLandscape",
        "BackpropagationChain",
    ],
}

# Output filename mapping (snake_case → kebab-case)
OUTPUT_NAMES = {
    "ScaledDotProductAttention": "attention-scaled-dot-product",
    "MultiHeadAttention": "attention-multi-head",
    "AttentionMatrixFlow": "attention-matrix-flow",
    "MatrixMultiplication": "matrix-multiplication",
    "MatrixTransform2D": "matrix-transform-2d",
    "EigenvalueVisualization": "matrix-eigenvalue",
    "GradientDescent": "gradient-descent",
    "LossLandscape": "gradient-loss-landscape",
    "BackpropagationChain": "gradient-backpropagation",
}


# ── Render ─────────────────────────────────────────────────────────────────────
def render_scene(module_name: str, scene_class: str) -> bool:
    """Render a single scene with manim, save to public/videos/."""
    scene_file = SCENES_DIR / f"{module_name}.py"
    if not scene_file.exists():
        print(f"[SKIP] Scene file not found: {scene_file}")
        return False

    output_name = OUTPUT_NAMES.get(scene_class, scene_class)
    output_path = str(PUBLIC_VIDEOS / output_name)

    # Ensure output dir exists
    PUBLIC_VIDEOS.mkdir(parents=True, exist_ok=True)

    cmd = [
        sys.executable, "-m", "manim",
        "-qm", QUALITY,  # quality flag
        "--media_dir", str(PUBLIC_VIDEOS / ".manim_media"),
        "--format", "mp4",
        str(scene_file),
        scene_class,
        "-o", f"{output_name}.mp4",
    ]

    print(f"\n{'='*60}")
    print(f"Rendering: {scene_class} → {output_name}.mp4")
    print(f"Module: {scene_file}")
    print(f"{'='*60}")

    result = subprocess.run(cmd, capture_output=False, text=True)
    return result.returncode == 0


def main():
    print("=" * 60)
    print("Manim Animation Batch Renderer")
    print(f"Quality: {QUALITY}")
    print(f"Output:  {PUBLIC_VIDEOS}")
    print("=" * 60)

    success_count = 0
    fail_count = 0

    for module_name, scene_classes in SCENE_MAP.items():
        for scene_class in scene_classes:
            if render_scene(module_name, scene_class):
                success_count += 1
                print(f"  OK {scene_class}")
            else:
                fail_count += 1
                print(f"  FAIL {scene_class}")

    print(f"\n{'='*60}")
    print(f"Done: {success_count} rendered, {fail_count} failed")
    print(f"Videos: {PUBLIC_VIDEOS}")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
