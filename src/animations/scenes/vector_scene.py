"""Manim scenes: Vector concepts — shopping list analogy."""

from manim import *
import numpy as np

__all__ = ["VectorShoppingList", "DotProductIntuition"]


class VectorShoppingList(Scene):
    """Explain vectors using a shopping list analogy."""

    def construct(self):
        title = Text("向量 = 一组数字", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Shopping list items
        items = [
            ("苹果", 3, RED),
            ("香蕉", 5, YELLOW),
            ("牛奶", 7, BLUE),
        ]

        # Show shopping list
        list_group = VGroup()
        for name, count, color in items:
            box = Rectangle(width=2, height=0.6, color=color, fill_opacity=0.2)
            text = Text(f"{name}: {count}个", font_size=24, color=color)
            item = VGroup(box, text)
            list_group.add(item)

        list_group.arrange(DOWN, buff=0.3)
        list_group.shift(LEFT * 3)
        self.play(LaggedStart(*[FadeIn(item) for item in list_group], lag_ratio=0.3))
        self.wait(0.5)

        # Arrow to vector
        arrow = Arrow(LEFT * 1, RIGHT * 1, color=WHITE)
        arrow.shift(RIGHT * 0.5)
        self.play(GrowArrow(arrow))

        # Vector notation
        vector = Matrix(
            [["3"], ["5"], ["7"]],
            left_bracket="[",
            right_bracket="]",
        )
        vector.scale(0.8)
        vector.shift(RIGHT * 3)
        self.play(Write(vector))
        self.wait(0.5)

        # Label
        label = Text("这就是一个向量！", font_size=28, color=GREEN)
        label.to_edge(DOWN)
        self.play(Write(label))
        self.wait(1)

        # Clear and show more examples
        self.play(FadeOut(VGroup(list_group, arrow, vector, label, title)))

        title2 = Text("向量无处不在", font_size=36, color=BLUE)
        title2.to_edge(UP)
        self.play(Write(title2))

        examples = VGroup(
            Text("人的信息: [年龄, 身高, 体重]", font_size=22),
            Text("像素颜色: [红, 绿, 蓝]", font_size=22),
            Text("词语含义: [0.2, -0.5, 0.8, ...]", font_size=22),
        ).arrange(DOWN, buff=0.5)
        examples.shift(DOWN * 0.5)

        self.play(LaggedStart(*[FadeIn(e) for e in examples], lag_ratio=0.4))
        self.wait(2)


class DotProductIntuition(Scene):
    """Explain dot product as matching score."""

    def construct(self):
        title = Text("点积 = 匹配程度", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Two vectors
        A = Matrix([["1"], ["2"], ["3"]], left_bracket="[", right_bracket="]")
        B = Matrix([["3"], ["2"], ["1"]], left_bracket="[", right_bracket="]")
        dot = MathTex(r"\cdot", font_size=36, color=YELLOW)
        eq = MathTex("=", font_size=36)
        result = MathTex("10", font_size=48, color=GREEN)

        formula = VGroup(A, dot, B, eq, result).arrange(RIGHT, buff=0.3)
        formula.shift(UP * 0.5)
        self.play(Write(formula))
        self.wait(0.5)

        # Show calculation step by step
        calc_lines = VGroup(
            MathTex(r"1 \times 3 = 3", font_size=28, color=RED),
            MathTex(r"2 \times 2 = 4", font_size=28, color=YELLOW),
            MathTex(r"3 \times 1 = 3", font_size=28, color=BLUE),
            MathTex(r"3 + 4 + 3 = 10", font_size=28, color=GREEN),
        ).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        calc_lines.shift(DOWN * 1.5)

        for line in calc_lines:
            self.play(Write(line), run_time=0.5)
        self.wait(1)

        # Meaning
        self.play(FadeOut(calc_lines))
        meaning = Text("点积越大 = 越匹配", font_size=28, color=ORANGE)
        meaning.shift(DOWN * 1.5)
        self.play(Write(meaning))
        self.wait(2)
