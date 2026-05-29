"""Manim scenes: LoRA and quantization concepts."""

from manim import *
import numpy as np

__all__ = ["LoRALowRank", "QuantizationIntuition"]


class LoRALowRank(Scene):
    """Explain LoRA: low-rank adaptation for fine-tuning."""

    def construct(self):
        title = Text("LoRA: 低秩适配", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Show full fine-tuning problem
        full_text = Text("全量微调: 4096 × 4096 = 1677万参数", font_size=24, color=RED)
        full_text.shift(UP * 2)
        self.play(Write(full_text))

        # Show LoRA approach
        lora_text = Text("LoRA: 只训练 0.39% 的参数", font_size=24, color=GREEN)
        lora_text.shift(UP * 1)
        self.play(Write(lora_text))

        # Show matrix decomposition
        W0 = Matrix(
            [["w_{11}", "w_{12}", "...", "w_{1n}"],
             ["w_{21}", "w_{22}", "...", "w_{2n}"],
             ["...", "...", "...", "..."],
             ["w_{n1}", "w_{n2}", "...", "w_{nn}"]],
            left_bracket="[",
            right_bracket="]",
        )
        W0.scale(0.5)
        W0.shift(LEFT * 4)

        equals = MathTex("=", font_size=36)
        equals.shift(LEFT * 2)

        W0_label = MathTex("W_0", font_size=28, color=GRAY)
        W0_label.next_to(W0, DOWN, buff=0.2)

        plus = MathTex("+", font_size=36, color=YELLOW)
        plus.shift(ORIGIN)

        A = Matrix(
            [["a_{11}", "a_{12}"],
             ["a_{21}", "a_{22}"],
             ["...", "..."],
             ["a_{n1}", "a_{n2}"]],
            left_bracket="[",
            right_bracket="]",
        )
        A.scale(0.5)
        A.shift(RIGHT * 2)

        B = Matrix(
            [["b_{11}", "b_{12}", "...", "b_{1n}"],
             ["b_{21}", "b_{22}", "...", "b_{nn}"]],
            left_bracket="[",
            right_bracket="]",
        )
        B.scale(0.5)
        B.shift(RIGHT * 4)

        times = MathTex(r"\times", font_size=36, color=YELLOW)
        times.shift(RIGHT * 3)

        A_label = MathTex("A", font_size=28, color=ORANGE)
        A_label.next_to(A, DOWN, buff=0.2)

        B_label = MathTex("B", font_size=28, color=ORANGE)
        B_label.next_to(B, DOWN, buff=0.2)

        self.play(
            Write(W0), Write(W0_label),
            Write(equals),
            Write(plus),
            Write(A), Write(A_label),
            Write(times),
            Write(B), Write(B_label),
        )
        self.wait(1)

        # Highlight the low-rank structure
        rank_text = Text("秩 r = 8 (远小于 4096)", font_size=24, color=ORANGE)
        rank_text.shift(DOWN * 2)
        self.play(Write(rank_text))

        # Show parameter count
        param_text = Text("参数量: 4096×8 + 8×4096 = 6.5万", font_size=24, color=GREEN)
        param_text.shift(DOWN * 2.5)
        self.play(Write(param_text))

        compression = Text("压缩比: 256 倍!", font_size=28, color=GREEN)
        compression.shift(DOWN * 3)
        self.play(Write(compression))
        self.wait(2)


class QuantizationIntuition(Scene):
    """Explain quantization: reducing precision."""

    def construct(self):
        title = Text("量化: 降低精度", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Show precision comparison
        precisions = VGroup(
            Text("FP32: 23.456789°C", font_size=24, color=RED),
            Text("FP16: 23.46°C", font_size=24, color=YELLOW),
            Text("INT8: 23.5°C", font_size=24, color=GREEN),
            Text("INT4: 23°C", font_size=24, color=BLUE),
        ).arrange(DOWN, buff=0.4, aligned_edge=LEFT)
        precisions.shift(UP * 1)
        self.play(LaggedStart(*[FadeIn(p) for p in precisions], lag_ratio=0.3))

        # Show memory comparison
        memory_text = Text("70B 模型的内存需求:", font_size=24, color=WHITE)
        memory_text.shift(DOWN * 1)
        self.play(Write(memory_text))

        memories = VGroup(
            Text("FP32: 280 GB", font_size=20, color=RED),
            Text("FP16: 140 GB", font_size=20, color=YELLOW),
            Text("INT8: 70 GB", font_size=20, color=GREEN),
            Text("INT4: 35 GB", font_size=20, color=BLUE),
        ).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        memories.shift(DOWN * 2)
        self.play(LaggedStart(*[FadeIn(m) for m in memories], lag_ratio=0.3))

        # Show that INT4 can run on consumer GPU
        gpu_text = Text("35 GB → 可以在消费级显卡上运行!", font_size=24, color=GREEN)
        gpu_text.shift(DOWN * 3)
        self.play(Write(gpu_text))
        self.wait(2)
