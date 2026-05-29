"""Manim scenes: Word embedding visualization."""

from manim import *
import numpy as np

__all__ = ["WordEmbeddingSpace", "EmbeddingAnalogy"]


class WordEmbeddingSpace(Scene):
    """Show how words map to points in a vector space."""

    def construct(self):
        title = Text("词嵌入: 把词变成向量", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # 2D plane representing embedding space
        plane = NumberPlane(
            x_range=[-4, 4, 1],
            y_range=[-3, 3, 1],
            background_line_style={"stroke_color": BLUE_D, "stroke_width": 1, "stroke_opacity": 0.3},
            axis_config={"color": WHITE},
        )
        plane.shift(DOWN * 0.3)
        self.play(Create(plane), run_time=1)

        # Words as points
        words = [
            ("猫", 1.5, 0.8, RED),
            ("狗", 1.2, 1.0, RED),
            ("鱼", -1.0, -0.5, GREEN),
            ("鸟", -0.8, 0.3, GREEN),
            ("苹果", -1.5, 1.2, ORANGE),
            ("香蕉", -1.8, 0.8, ORANGE),
        ]

        dots = VGroup()
        labels = VGroup()
        for word, x, y, color in words:
            dot = Dot(plane.c2p(x, y), color=color, radius=0.1)
            label = Text(word, font_size=16, color=color)
            label.next_to(dot, UP, buff=0.1)
            dots.add(dot)
            labels.add(label)

        self.play(
            LaggedStart(*[FadeIn(d, scale=2) for d in dots], lag_ratio=0.2),
            LaggedStart(*[FadeIn(l) for l in labels], lag_ratio=0.2),
        )
        self.wait(0.5)

        # Highlight similar words clustering together
        cluster1 = Circle(radius=1.2, color=RED, stroke_width=2, stroke_opacity=0.5)
        cluster1.move_to(plane.c2p(1.35, 0.9))
        cluster1_label = Text("动物", font_size=16, color=RED)
        cluster1_label.next_to(cluster1, RIGHT, buff=0.2)

        cluster2 = Circle(radius=1.0, color=ORANGE, stroke_width=2, stroke_opacity=0.5)
        cluster2.move_to(plane.c2p(-1.65, 1.0))
        cluster2_label = Text("水果", font_size=16, color=ORANGE)
        cluster2_label.next_to(cluster2, LEFT, buff=0.2)

        self.play(
            Create(cluster1), Write(cluster1_label),
            Create(cluster2), Write(cluster2_label),
        )
        self.wait(1)

        # Distance demonstration
        dist_label = Text("相似的词 → 向量距离近", font_size=22, color=GREEN)
        dist_label.to_edge(DOWN)
        self.play(Write(dist_label))
        self.wait(2)


class EmbeddingAnalogy(Scene):
    """Show the famous analogy: king - man + woman = queen."""

    def construct(self):
        title = Text("神奇的类比推理", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # The analogy
        analogy = MathTex(
            r"\vec{国王} - \vec{男人} + \vec{女人} \approx \vec{王后}",
            font_size=36,
            color=BLUE,
        )
        analogy.shift(UP * 0.5)
        self.play(Write(analogy))
        self.wait(0.5)

        # Visualize in 2D
        plane = NumberPlane(
            x_range=[-3, 3, 1],
            y_range=[-2, 2, 1],
            background_line_style={"stroke_color": BLUE_D, "stroke_width": 1, "stroke_opacity": 0.2},
            axis_config={"color": WHITE, "include_numbers": False},
        )
        plane.shift(DOWN * 1)

        # Points
        king = Dot(plane.c2p(1.5, 1), color=RED, radius=0.1)
        man = Dot(plane.c2p(1.5, -0.5), color=BLUE, radius=0.1)
        woman = Dot(plane.c2p(-0.5, 1), color=PINK, radius=0.1)
        queen = Dot(plane.c2p(-0.5, -0.5), color=GREEN, radius=0.1)

        king_label = Text("国王", font_size=16, color=RED).next_to(king, UP, buff=0.1)
        man_label = Text("男人", font_size=16, color=BLUE).next_to(man, DOWN, buff=0.1)
        woman_label = Text("女人", font_size=16, color=PINK).next_to(woman, UP, buff=0.1)
        queen_label = Text("王后", font_size=16, color=GREEN).next_to(queen, DOWN, buff=0.1)

        self.play(Create(plane), run_time=1)
        self.play(
            FadeIn(king), Write(king_label),
            FadeIn(man), Write(man_label),
            FadeIn(woman), Write(woman_label),
            FadeIn(queen), Write(queen_label),
        )
        self.wait(0.5)

        # Show the vector arithmetic
        # king - man ≈ gender direction
        arrow1 = Arrow(
            man.get_center(),
            king.get_center(),
            color=YELLOW,
            stroke_width=2,
        )
        arrow1_label = Text("性别方向", font_size=14, color=YELLOW)
        arrow1_label.next_to(arrow1, RIGHT, buff=0.1)

        self.play(GrowArrow(arrow1), Write(arrow1_label))

        # woman + gender direction ≈ queen
        arrow2 = Arrow(
            woman.get_center(),
            queen.get_center(),
            color=YELLOW,
            stroke_width=2,
        )
        self.play(GrowArrow(arrow2))

        # Dashed line showing parallel
        dashed = DashedLine(
            arrow1.get_start(),
            arrow2.get_start(),
            color=GRAY,
            stroke_width=1,
        )
        self.play(Create(dashed))

        explanation = Text(
            "向量空间捕捉到了「性别」这个语义维度！",
            font_size=20,
            color=GREEN,
        )
        explanation.to_edge(DOWN)
        self.play(Write(explanation))
        self.wait(2)
