"""Manim scenes: Attention mechanism visualization."""

from manim import *
import numpy as np

__all__ = ["ScaledDotProductAttention", "MultiHeadAttention", "AttentionMatrixFlow"]


class ScaledDotProductAttention(Scene):
    """QKV computation → attention scores → weighted sum."""

    def construct(self):
        # ── 1. Q, K, V matrices ──
        title = Text("缩放点积注意力", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # Q matrix
        q_label = MathTex("Q", color=BLUE, font_size=40)
        q_matrix = Matrix(
            [[f"q_{{{i},{j}}}" for j in range(1, 4)] for i in range(1, 4)],
            left_bracket="[",
            right_bracket="]",
        )
        q_group = VGroup(q_label, q_matrix).arrange(DOWN, buff=0.2)
        q_group.scale(0.7)

        # K matrix
        k_label = MathTex("K", color=GREEN, font_size=40)
        k_matrix = Matrix(
            [[f"k_{{{i},{j}}}" for j in range(1, 4)] for i in range(1, 4)],
            left_bracket="[",
            right_bracket="]",
        )
        k_group = VGroup(k_label, k_matrix).arrange(DOWN, buff=0.2)
        k_group.scale(0.7)

        # V matrix
        v_label = MathTex("V", color=ORANGE, font_size=40)
        v_matrix = Matrix(
            [[f"v_{{{i},{j}}}" for j in range(1, 4)] for i in range(1, 4)],
            left_bracket="[",
            right_bracket="]",
        )
        v_group = VGroup(v_label, v_matrix).arrange(DOWN, buff=0.2)
        v_group.scale(0.7)

        # Arrange Q, K, V horizontally
        matrices = VGroup(q_group, k_group, v_group).arrange(RIGHT, buff=0.6)
        matrices.shift(DOWN * 0.5)
        self.play(
            Write(q_group), Write(k_group), Write(v_group), run_time=2
        )
        self.wait(0.5)

        # Label: "输入序列 → Q/K/V 线性变换"
        input_label = Text(
            "输入序列  →  Q / K / V 线性变换",
            font_size=24,
            color=GRAY,
        )
        input_label.next_to(matrices, DOWN, buff=0.4)
        self.play(Write(input_label))
        self.wait(0.5)

        # ── 2. Q × K^T → attention scores ──
        self.play(FadeOut(input_label))
        score_label = Text("Q × K^T  →  注意力分数", font_size=28, color=YELLOW)
        score_label.next_to(title, DOWN, buff=0.4)

        # Animate the matrix multiply by highlighting
        attention_scores = Matrix(
            [[f"s_{{{i},{j}}}" for j in range(1, 4)] for i in range(1, 4)],
            left_bracket="[",
            right_bracket="]",
        )
        attention_scores.scale(0.7)
        attention_scores.shift(DOWN * 0.5)

        q_copy = q_group.copy().set_opacity(0.5)
        k_copy_T = k_group.copy().set_opacity(0.5)
        multiply_arrow = MathTex(r"\times", color=YELLOW, font_size=48)

        mult_group = VGroup(q_copy, multiply_arrow, k_copy_T,
                            attention_scores).arrange(RIGHT, buff=0.3)
        mult_group.shift(DOWN * 0.5)

        self.play(
            ReplacementTransform(matrices, VGroup(q_copy, k_copy_T, v_group.copy().set_opacity(0.3))),
            Write(score_label),
            run_time=1.5,
        )
        self.play(
            FadeIn(multiply_arrow),
            FadeIn(attention_scores),
            FadeOut(k_copy_T),
            run_time=1.5,
        )

        # ── 3. Softmax normalization ──
        self.wait(0.3)
        softmax_label = Text("Softmax 归一化 → 注意力权重", font_size=28, color=GREEN)
        softmax_label.next_to(title, DOWN, buff=0.4)

        weights = Matrix(
            [[f"\\alpha_{{{i},{j}}}" for j in range(1, 4)] for i in range(1, 4)],
            left_bracket="[",
            right_bracket="]",
        )
        weights.scale(0.7)
        weights.shift(DOWN * 0.5)

        arrow_sm = MathTex(r"\xrightarrow{\text{softmax}}", color=GREEN, font_size=36)

        sm_group = VGroup(
            attention_scores.copy(),
            arrow_sm,
            weights,
        ).arrange(RIGHT, buff=0.2)

        self.play(
            ReplacementTransform(score_label, softmax_label),
            ReplacementTransform(
                VGroup(attention_scores, multiply_arrow),
                sm_group,
            ),
            run_time=2,
        )

        self.wait(0.5)

        # ── 4. Weight × V → output ──
        output_label = Text("α × V  →  加权输出", font_size=28, color=PURPLE)
        output_label.next_to(title, DOWN, buff=0.4)

        output_matrix = Matrix(
            [[f"o_{{{i}}}" for _ in range(1)] for i in range(1, 4)],
            left_bracket="[",
            right_bracket="]",
        )
        output_matrix.scale(0.7)
        output_matrix.shift(DOWN * 0.5)

        self.play(
            ReplacementTransform(softmax_label, output_label),
            ReplacementTransform(sm_group, output_matrix),
            run_time=1.5,
        )

        # ── 5. Formula reveal ──
        self.wait(0.3)
        self.play(FadeOut(output_label), FadeOut(output_matrix))
        formula = MathTex(
            r"\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V",
            font_size=42,
            color=BLUE,
        )
        self.play(Write(formula))
        self.wait(1.5)
        self.play(FadeOut(formula))


class MultiHeadAttention(Scene):
    """Multi-Head Attention: split → attend → concat."""

    def construct(self):
        title = Text("多头注意力", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Show the split into heads
        heads_text = Text("将 Q/K/V 拆分为 h 个头", font_size=28, color=YELLOW)
        heads_text.next_to(title, DOWN, buff=0.5)
        self.play(Write(heads_text))

        # Multiple attention boxes
        head_colors = [BLUE, GREEN, ORANGE, PURE_RED, PINK, TEAL, YELLOW, PURPLE]
        heads = VGroup()
        for i in range(4):
            box = Square(side_length=0.8, color=head_colors[i])
            label = Text(f"头{i+1}", font_size=16, color=head_colors[i])
            group = VGroup(box, label).arrange(DOWN, buff=0.1)
            heads.add(group)
        heads.arrange(RIGHT, buff=0.3)
        heads.shift(DOWN)

        self.play(LaggedStart(*[Write(h) for h in heads], lag_ratio=0.2))
        self.wait(0.5)

        # Concat
        arrow = Arrow(LEFT, RIGHT, color=WHITE)
        concat_label = Text("拼接 + 线性变换", font_size=28, color=GREEN)
        concat_group = VGroup(arrow, concat_label).arrange(DOWN, buff=0.2)
        concat_group.next_to(heads, DOWN, buff=0.6)

        self.play(Write(concat_group))
        self.wait(0.3)

        # Final formula
        self.play(FadeOut(VGroup(heads, heads_text, concat_group, title)))
        formula = MathTex(
            r"\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1,\ldots,\text{head}_h)W^O",
            font_size=38,
            color=BLUE,
        )
        formula2 = MathTex(
            r"\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)",
            font_size=34,
            color=GRAY,
        )
        formula_group = VGroup(formula, formula2).arrange(DOWN, buff=0.4)
        self.play(Write(formula_group))
        self.wait(1.5)


class AttentionMatrixFlow(Scene):
    """Show attention matrix as a heatmap-like visualization."""

    def construct(self):
        title = Text("注意力矩阵可视化", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Build a 6x6 attention matrix with squares
        n = 6
        cells = VGroup()
        colors = interpolate_color(YELLOW, RED, n * n)

        # Random-ish attention pattern (higher on diagonal + nearby)
        rng = np.random.RandomState(42)
        raw = np.zeros((n, n))
        for i in range(n):
            for j in range(n):
                raw[i, j] = np.exp(-abs(i - j) / 2) + rng.uniform(0, 0.2)
        raw = raw / raw.sum(axis=1, keepdims=True)

        for i in range(n):
            for j in range(n):
                intensity = raw[i, j]
                color = interpolate_color(WHITE, BLUE, intensity)
                cell = Square(side_length=0.7, fill_color=color,
                              fill_opacity=0.6 + intensity * 0.4, stroke_color=GRAY)
                cell.move_to(np.array([j * 0.75 - (n - 1) * 0.375,
                                       -(i - (n - 1) / 2) * 0.75, 0]))
                cells.add(cell)

        cells.shift(DOWN * 0.5)
        self.play(LaggedStart(
            *[FadeIn(c, scale=0.5) for c in cells],
            lag_ratio=0.03,
        ))
        self.wait(0.5)

        # Animate: highlight a row to show "this token attending to all others"
        highlight_box = SurroundingRectangle(
            VGroup(*cells[i * n:(i + 1) * n]),
            color=YELLOW,
            buff=0.05,
        )
        row_label = Text("当前 token 关注所有位置", font_size=24, color=YELLOW)
        row_label.next_to(cells, DOWN, buff=0.5)

        self.play(
            Create(highlight_box),
            Write(row_label),
        )
        self.wait(1)

        # Formula
        self.play(FadeOut(VGroup(cells, highlight_box, row_label, title)))
        formula = MathTex(
            r"\text{Attention weights} = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)",
            font_size=38,
            color=BLUE,
        )
        self.play(Write(formula))
        self.wait(1.5)
