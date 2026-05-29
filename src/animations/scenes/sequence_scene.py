"""Manim scenes: RNN/LSTM sequence model visualization."""

from manim import *
import numpy as np

__all__ = ["RNNUnfold", "LSTMGateFlow"]


class RNNUnfold(Scene):
    """Show RNN unrolled through time steps."""

    def construct(self):
        title = Text("RNN: 有记忆的网络", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Time steps
        steps = VGroup()
        for t in range(4):
            # Cell
            cell = Rectangle(width=1.5, height=1, color=BLUE, fill_opacity=0.2)
            cell_label = MathTex(f"h_{t}", font_size=24, color=BLUE)

            # Input
            input_arrow = Arrow(UP * 0.5, DOWN * 0.1, color=GREEN, stroke_width=2)
            input_label = MathTex(f"x_{t}", font_size=20, color=GREEN)

            # Output
            output_arrow = Arrow(DOWN * 0.1, DOWN * 0.5, color=ORANGE, stroke_width=2)
            output_label = MathTex(f"y_{t}", font_size=20, color=ORANGE)

            step = VGroup(
                input_label, input_arrow,
                cell, cell_label,
                output_arrow, output_label,
            ).arrange(DOWN, buff=0.1)
            steps.add(step)

        steps.arrange(RIGHT, buff=1.2)
        steps.shift(DOWN * 0.3)
        self.play(LaggedStart(*[FadeIn(s) for s in steps], lag_ratio=0.3))
        self.wait(0.5)

        # Hidden state arrows (memory)
        hidden_arrows = VGroup()
        for t in range(3):
            arrow = Arrow(
                steps[t].get_right(),
                steps[t + 1].get_left(),
                color=YELLOW,
                stroke_width=3,
            )
            hidden_arrows.add(arrow)

        hidden_label = Text("记忆传递", font_size=20, color=YELLOW)
        hidden_label.next_to(hidden_arrows, UP, buff=0.2)

        self.play(
            LaggedStart(*[GrowArrow(a) for a in hidden_arrows], lag_ratio=0.3),
            Write(hidden_label),
        )
        self.wait(1)

        # Explanation
        explanation = Text(
            "每一步都接收新输入 + 上一步的记忆",
            font_size=22,
            color=GREEN,
        )
        explanation.to_edge(DOWN)
        self.play(Write(explanation))
        self.wait(2)

        # Formula
        self.play(FadeOut(VGroup(steps, hidden_arrows, hidden_label, explanation, title)))
        formula = MathTex(
            r"h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t + b)",
            font_size=32,
            color=BLUE,
        )
        meaning = Text("当前记忆 = f(旧记忆, 新输入)", font_size=22, color=GRAY)
        group = VGroup(formula, meaning).arrange(DOWN, buff=0.3)
        self.play(Write(formula), Write(meaning))
        self.wait(2)


class LSTMGateFlow(Scene):
    """Visualize LSTM gates controlling information flow."""

    def construct(self):
        title = Text("LSTM: 选择性遗忘", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Cell state highway
        highway = Line(LEFT * 4, RIGHT * 4, color=WHITE, stroke_width=4)
        highway.shift(DOWN * 0.3)
        highway_label = Text("细胞状态 (信息高速公路)", font_size=16, color=GRAY)
        highway_label.next_to(highway, UP, buff=0.2)
        self.play(Create(highway), Write(highway_label))

        # Three gates
        gates = VGroup()
        gate_data = [
            ("遗忘门", "丢掉旧信息", RED, LEFT * 2),
            ("输入门", "存入新信息", GREEN, ORIGIN),
            ("输出门", "输出有用信息", BLUE, RIGHT * 2),
        ]

        for name, desc, color, pos in gate_data:
            gate_box = Rectangle(width=1.5, height=0.8, color=color, fill_opacity=0.3)
            gate_label = Text(name, font_size=16, color=color)
            gate_desc = Text(desc, font_size=12, color=GRAY)
            gate = VGroup(gate_box, gate_label, gate_desc).arrange(DOWN, buff=0.1)
            gate.shift(pos + DOWN * 1.5)
            gates.add(gate)

        self.play(LaggedStart(*[FadeIn(g) for g in gates], lag_ratio=0.3))
        self.wait(0.5)

        # Show gate actions
        # Forget gate: remove some info
        forget_arrow = Arrow(
            gates[0].get_top(),
            highway.get_center() + LEFT * 2,
            color=RED,
            stroke_width=2,
        )
        forget_text = Text("×", font_size=24, color=RED)
        forget_text.move_to(highway.get_center() + LEFT * 2 + UP * 0.3)

        self.play(GrowArrow(forget_arrow), Write(forget_text))

        # Input gate: add new info
        input_arrow = Arrow(
            gates[1].get_top(),
            highway.get_center(),
            color=GREEN,
            stroke_width=2,
        )
        input_text = Text("+", font_size=24, color=GREEN)
        input_text.move_to(highway.get_center() + UP * 0.3)

        self.play(GrowArrow(input_arrow), Write(input_text))

        # Output gate: read from cell
        output_arrow = Arrow(
            highway.get_center() + RIGHT * 2,
            gates[2].get_top(),
            color=BLUE,
            stroke_width=2,
        )
        output_text = Text("read", font_size=16, color=BLUE)
        output_text.move_to(highway.get_center() + RIGHT * 2 + UP * 0.3)

        self.play(GrowArrow(output_arrow), Write(output_text))

        # Analogy
        analogy = Text(
            "像考试复习: 忘掉不重要的，记住重要的，只回忆相关的",
            font_size=18,
            color=GREEN,
        )
        analogy.to_edge(DOWN)
        self.play(Write(analogy))
        self.wait(2)
