"""Manim scenes: Derivative and chain rule intuition."""

from manim import *
import numpy as np

__all__ = ["DerivativeAsSlope", "ChainRuleFlow", "GradientDescentIntuition"]


class DerivativeAsSlope(Scene):
    """Explain derivative as the slope of a curve."""

    def construct(self):
        title = Text("导数 = 变化的速度", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Draw a curve
        axes = Axes(
            x_range=[-1, 5, 1],
            y_range=[-1, 5, 1],
            x_length=7,
            y_length=4,
            axis_config={"color": WHITE},
        )
        axes.shift(DOWN * 0.3)
        self.play(Create(axes))

        # f(x) = 0.15 * (x-1)^3 - 0.5*(x-1)^2 + 2
        def f(x):
            return 0.15 * (x - 1) ** 3 - 0.5 * (x - 1) ** 2 + 2

        graph = axes.plot(f, x_range=[-0.5, 4.5], color=BLUE)
        self.play(Create(graph), run_time=1.5)

        # Pick a point
        x0 = 2.0
        dot = Dot(axes.c2p(x0, f(x0)), color=RED, radius=0.08)
        self.play(FadeIn(dot))

        # Tangent line
        slope = 0.45 * (x0 - 1) ** 2 - 1.0 * (x0 - 1)
        tangent = axes.plot(
            lambda x: f(x0) + slope * (x - x0),
            x_range=[x0 - 1.5, x0 + 1.5],
            color=YELLOW,
        )
        tangent_label = MathTex(
            f"斜率 = {slope:.1f}", font_size=24, color=YELLOW
        )
        tangent_label.next_to(tangent, UP, buff=0.2)

        self.play(Create(tangent), Write(tangent_label))
        self.wait(0.5)

        # Move the point
        for x_new in [2.5, 3.0, 3.5]:
            new_dot = Dot(axes.c2p(x_new, f(x_new)), color=RED, radius=0.08)
            new_slope = 0.45 * (x_new - 1) ** 2 - 1.0 * (x_new - 1)
            new_tangent = axes.plot(
                lambda x, xn=x_new, s=new_slope: f(xn) + s * (x - xn),
                x_range=[xn - 1.5, xn + 1.5],
                color=YELLOW,
            )
            new_label = MathTex(
                f"斜率 = {new_slope:.1f}", font_size=24, color=YELLOW
            )
            new_label.next_to(new_tangent, UP, buff=0.2)

            self.play(
                Transform(dot, new_dot),
                Transform(tangent, new_tangent),
                Transform(tangent_label, new_label),
                run_time=1,
            )

        self.wait(1)

        # Final formula
        self.play(FadeOut(VGroup(axes, graph, dot, tangent, tangent_label, title)))
        formula = MathTex(
            r"f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}",
            font_size=36,
            color=BLUE,
        )
        explanation = Text(
            "导数 = 函数在某一点的变化率",
            font_size=24,
            color=GRAY,
        )
        group = VGroup(formula, explanation).arrange(DOWN, buff=0.4)
        self.play(Write(formula), Write(explanation))
        self.wait(2)


class ChainRuleFlow(Scene):
    """Visualize chain rule as connected steps."""

    def construct(self):
        title = Text("链式法则: 多步变化怎么算", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Chain: x → f → g → h → y
        boxes = VGroup()
        labels = ["输入 x", "f(x)", "g(f(x))", "h(g(f(x)))", "输出 y"]
        colors = [BLUE, GREEN, YELLOW, ORANGE, RED]

        for label, color in zip(labels, colors):
            box = Rectangle(width=1.8, height=0.8, color=color, fill_opacity=0.2)
            text = Text(label, font_size=16, color=color)
            group = VGroup(box, text)
            boxes.add(group)

        boxes.arrange(RIGHT, buff=0.5)
        boxes.shift(DOWN * 0.5)
        self.play(LaggedStart(*[FadeIn(b) for b in boxes], lag_ratio=0.2))
        self.wait(0.5)

        # Forward arrows
        fwd = VGroup()
        for i in range(len(boxes) - 1):
            arrow = Arrow(
                boxes[i].get_right(),
                boxes[i + 1].get_left(),
                color=BLUE,
                stroke_width=2,
            )
            fwd.add(arrow)

        fwd_label = Text("前向: 数据流动", font_size=20, color=BLUE)
        fwd_label.next_to(fwd, UP, buff=0.2)
        self.play(
            LaggedStart(*[GrowArrow(a) for a in fwd], lag_ratio=0.15),
            Write(fwd_label),
        )
        self.wait(0.5)

        # Backward arrows
        bwd = VGroup()
        for i in range(len(boxes) - 1, 0, -1):
            arrow = Arrow(
                boxes[i].get_left(),
                boxes[i - 1].get_right(),
                color=RED,
                stroke_width=2,
            )
            bwd.add(arrow)

        bwd_label = Text("反向: 梯度流动", font_size=20, color=RED)
        bwd_label.next_to(bwd, DOWN, buff=0.2)
        self.play(
            LaggedStart(*[GrowArrow(a) for a in bwd], lag_ratio=0.15),
            Write(bwd_label),
        )
        self.wait(0.5)

        # Chain rule formula
        self.play(FadeOut(VGroup(boxes, fwd, fwd_label, bwd, bwd_label, title)))
        formula = MathTex(
            r"\frac{dy}{dx} = \frac{dy}{dh} \cdot \frac{dh}{dg} \cdot \frac{dg}{df} \cdot \frac{df}{dx}",
            font_size=32,
            color=BLUE,
        )
        meaning = Text(
            "总变化 = 每步变化的乘积",
            font_size=24,
            color=GRAY,
        )
        group = VGroup(formula, meaning).arrange(DOWN, buff=0.4)
        self.play(Write(formula), Write(meaning))
        self.wait(2)


class GradientDescentIntuition(Scene):
    """Gradient descent as rolling a ball downhill."""

    def construct(self):
        title = Text("梯度下降: 蒙眼下山", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Draw a valley
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-1, 5, 1],
            x_length=8,
            y_length=4,
            axis_config={"color": WHITE},
        )
        axes.shift(DOWN * 0.5)
        self.play(Create(axes))

        # Valley curve: f(x) = x^2
        valley = axes.plot(lambda x: x ** 2, x_range=[-2.5, 2.5], color=BLUE)
        self.play(Create(valley), run_time=1)

        # Ball at top
        ball = Dot(axes.c2p(2.0, 4.0), color=RED, radius=0.15)
        ball_label = Text("你在这里", font_size=20, color=RED)
        ball_label.next_to(ball, UP, buff=0.2)
        self.play(FadeIn(ball), Write(ball_label))

        # Roll down
        x = 2.0
        lr = 0.3
        for _ in range(8):
            x_new = x - lr * 2 * x  # gradient of x^2 is 2x
            new_ball = Dot(axes.c2p(x_new, x_new ** 2), color=RED, radius=0.15)
            self.play(Transform(ball, new_ball), run_time=0.4)
            x = x_new

        # Bottom label
        bottom_label = Text("到达最低点！", font_size=24, color=GREEN)
        bottom_label.next_to(ball, DOWN, buff=0.3)
        self.play(Write(bottom_label))
        self.wait(1)

        # Formula
        self.play(FadeOut(VGroup(axes, valley, ball, ball_label, bottom_label, title)))
        formula = MathTex(
            r"\theta_{t+1} = \theta_t - \eta \nabla L(\theta_t)",
            font_size=42,
            color=BLUE,
        )
        parts = VGroup(
            Text("参数 = 参数 - 学习率 × 梯度", font_size=22, color=GRAY),
        ).arrange(DOWN, buff=0.3)
        group = VGroup(formula, parts).arrange(DOWN, buff=0.3)
        self.play(Write(formula), Write(parts[0]))
        self.wait(2)
