"""Manim scenes: Matrix operations visualization."""

from manim import *
import numpy as np

__all__ = ["MatrixMultiplication", "MatrixTransform2D", "EigenvalueVisualization"]


class MatrixMultiplication(Scene):
    """Visualize matrix × vector multiplication step by step."""

    def construct(self):
        title = Text("矩阵 × 向量 乘法", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Matrix A (3x3)
        A = Matrix(
            [["a_{11}", "a_{12}", "a_{13}"],
             ["a_{21}", "a_{22}", "a_{23}"],
             ["a_{31}", "a_{32}", "a_{33}"]],
            left_bracket="[",
            right_bracket="]",
        )
        A.scale(0.7)

        # Vector x (3x1)
        x = Matrix(
            [["x_1"], ["x_2"], ["x_3"]],
            left_bracket="[",
            right_bracket="]",
        )
        x.scale(0.7)

        # Equals
        eq = MathTex("=", font_size=48)

        # Result b (3x1)
        b = Matrix(
            [["b_1"], ["b_2"], ["b_3"]],
            left_bracket="[",
            right_bracket="]",
        )
        b.scale(0.7)

        # Arrange: A × x = b
        formula = VGroup(A, MathTex(r"\times", font_size=36, color=YELLOW),
                         x, eq, b).arrange(RIGHT, buff=0.25)
        formula.shift(DOWN * 1.0)
        self.play(Write(formula))
        self.wait(0.5)

        # Highlight: row × column = element
        row_label = Text("行 × 列 → 逐元素", font_size=24, color=YELLOW)
        row_label.next_to(formula, DOWN, buff=0.4)
        self.play(Write(row_label))
        self.wait(0.5)

        # Show weight sum: b_i = Σ a_ij * x_j
        b1_formula = MathTex(
            r"b_1 = a_{11}x_1 + a_{12}x_2 + a_{13}x_3",
            font_size=30,
            color=GREEN,
        )
        b1_formula.next_to(row_label, DOWN, buff=0.3)
        self.play(Write(b1_formula))
        self.wait(0.8)

        # Fade out to full formula
        self.play(FadeOut(VGroup(row_label, b1_formula, formula, title)))
        final_formula = MathTex(
            r"\mathbf{b} = \mathbf{A} \cdot \mathbf{x}",
            font_size=48,
            color=BLUE,
        )
        final_formula2 = MathTex(
            r"b_i = \sum_{j=1}^{n} a_{ij} \cdot x_j",
            font_size=36,
            color=GRAY,
        )
        fg = VGroup(final_formula, final_formula2).arrange(DOWN, buff=0.3)
        self.play(Write(fg))
        self.wait(1.5)


class MatrixTransform2D(Scene):
    """Show how a 2×2 matrix transforms a grid of points."""

    def construct(self):
        title = Text("矩阵变换: 二维空间", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Coordinate grid
        grid = NumberPlane(
            x_range=[-5, 5, 1],
            y_range=[-5, 5, 1],
            background_line_style={
                "stroke_color": BLUE_D,
                "stroke_width": 1,
                "stroke_opacity": 0.4,
            },
            axis_config={"color": WHITE},
        )
        grid.shift(DOWN * 0.3)
        self.play(Create(grid, run_time=1.5))

        # Unit vectors
        i_hat = Vector(RIGHT, color=RED).shift(DOWN * 0.3)
        j_hat = Vector(UP, color=GREEN).shift(DOWN * 0.3)
        i_label = MathTex("\\hat{i}", color=RED, font_size=30).next_to(
            i_hat.get_end(), DR, buff=0.1
        )
        j_label = MathTex("\\hat{j}", color=GREEN, font_size=30).next_to(
            j_hat.get_end(), UR, buff=0.1
        )
        self.play(
            Create(i_hat), Create(j_hat),
            Write(i_label), Write(j_label),
        )
        self.wait(0.5)

        # Matrix M = [[2, 1], [0, 2]] — shear
        M = np.array([[2.0, 1.0], [0.0, 2.0]])
        matrix_formula = MathTex(
            r"\mathbf{M} = \begin{bmatrix} 2 & 1 \\ 0 & 2 \end{bmatrix}",
            font_size=32,
            color=YELLOW,
        )
        matrix_formula.to_corner(UR)
        self.play(Write(matrix_formula))
        self.wait(0.5)

        # Apply transformation to the grid
        new_i = M @ np.array([1, 0])
        new_j = M @ np.array([0, 1])

        new_i_hat = Vector(new_i, color=RED).shift(DOWN * 0.3)
        new_j_hat = Vector(new_j, color=GREEN).shift(DOWN * 0.3)
        new_i_label = MathTex("\\hat{i}'", color=RED, font_size=30).next_to(
            new_i_hat.get_end(), DR, buff=0.1
        )
        new_j_label = MathTex("\\hat{j}'", color=GREEN, font_size=30).next_to(
            new_j_hat.get_end(), UR, buff=0.1
        )

        self.play(
            Transform(i_hat, new_i_hat),
            Transform(j_hat, new_j_hat),
            Transform(i_label, new_i_label),
            Transform(j_label, new_j_label),
            grid.animate.apply_matrix(M).shift(DOWN * 0.3),
            run_time=2,
        )
        self.wait(1)

        # Show det effect
        det = np.linalg.det(M)
        det_text = MathTex(
            f"\\det(\\mathbf{{M}}) = {det:.0f}",
            font_size=28,
            color=ORANGE,
        )
        det_text.next_to(matrix_formula, DOWN, buff=0.3)
        self.play(Write(det_text))
        self.wait(1.5)


class EigenvalueVisualization(Scene):
    """Visualize Av = λv: eigenvectors are not rotated."""

    def construct(self):
        title = Text("特征值分解:  A v = λ v", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        grid = NumberPlane(
            x_range=[-5, 5, 1],
            y_range=[-5, 5, 1],
            background_line_style={
                "stroke_color": BLUE_D,
                "stroke_width": 1,
                "stroke_opacity": 0.3,
            },
            axis_config={"color": WHITE},
        )
        grid.shift(DOWN * 0.3)
        self.play(Create(grid, run_time=1))

        # Matrix: [[2, 0], [0, 0.5]] - scales x by 2, y by 0.5
        M = np.array([[2.0, 0.0], [0.0, 0.5]])
        matrix_formula = MathTex(
            r"\mathbf{A} = \begin{bmatrix} 2 & 0 \\ 0 & 0.5 \end{bmatrix}",
            font_size=28,
            color=YELLOW,
        )
        matrix_formula.to_corner(UR)
        self.play(Write(matrix_formula))

        # Eigenvector 1: [1, 0] (x-axis)
        v1 = Vector(RIGHT * 1.5, color=RED).shift(DOWN * 0.3)
        v1_label = MathTex("v", color=RED, font_size=28).next_to(
            v1.get_end(), DR, buff=0.1
        )
        self.play(Create(v1), Write(v1_label))
        self.wait(0.3)

        # Transform: Av1 = 2*v1 (stretched)
        Av1 = Vector(RIGHT * 3.0, color=ORANGE).shift(DOWN * 0.3)
        Av1_label = MathTex("\\lambda v", color=ORANGE, font_size=28).next_to(
            Av1.get_end(), DR, buff=0.1
        )
        self.play(
            Transform(v1, Av1),
            Transform(v1_label, Av1_label),
            grid.animate.apply_matrix(M).shift(DOWN * 0.3),
            run_time=2,
        )
        self.wait(1)

        # Formula
        self.play(FadeOut(VGroup(v1, v1_label, grid, matrix_formula, title)))
        formula = MathTex(
            r"\mathbf{A} \mathbf{v} = \lambda \mathbf{v}",
            font_size=48,
            color=BLUE,
        )
        formula2 = MathTex(
            r"\det(\mathbf{A} - \lambda \mathbf{I}) = 0",
            font_size=36,
            color=GRAY,
        )
        fg = VGroup(formula, formula2).arrange(DOWN, buff=0.4)
        self.play(Write(fg))
        self.wait(1.5)
