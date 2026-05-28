"""Manim scenes: Gradient descent and backpropagation visualization."""

from manim import *
import numpy as np

__all__ = ["GradientDescent", "LossLandscape", "BackpropagationChain"]


class GradientDescent(Scene):
    """Gradient descent on a 1D curve."""

    def construct(self):
        title = Text("梯度下降", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Loss function: f(x) = x^4 - 3x^3 + 2
        axes = Axes(
            x_range=[-1.5, 3.5, 0.5],
            y_range=[-3, 4, 1],
            x_length=8,
            y_length=5,
            axis_config={"color": WHITE, "include_numbers": True},
        )
        axes.shift(DOWN * 0.3)
        self.play(Create(axes))

        graph = axes.plot(
            lambda x: x ** 4 - 3 * x ** 3 + 2,
            x_range=[-1.2, 3.2],
            color=BLUE,
        )
        self.play(Create(graph), run_time=1.5)

        # Labels
        loss_label = MathTex("L(\\theta)", font_size=28, color=BLUE)
        loss_label.next_to(axes.c2p(2.8, 3.5), UP)
        param_label = MathTex("\\theta", font_size=28, color=WHITE)
        param_label.next_to(axes.c2p(3.2, 0), DOWN)
        self.play(Write(loss_label), Write(param_label))

        # Start point
        start_x = 3.0
        def f(x): return x ** 4 - 3 * x ** 3 + 2
        dot = Dot(axes.c2p(start_x, f(start_x)), color=RED)
        self.play(FadeIn(dot))

        # Gradient descent steps
        lr = 0.02
        x = start_x
        trajectory = [dot]
        for _ in range(20):
            grad = 4 * x ** 3 - 9 * x ** 2
            x_new = x - lr * grad
            new_dot = Dot(
                axes.c2p(x_new, f(x_new)),
                color=RED,
            )
            trajectory.append(new_dot)
            self.play(
                Transform(dot, new_dot),
                run_time=0.15,
            )
            x = x_new

        self.wait(0.3)

        # Draw path
        path = VMobject(color=YELLOW, stroke_width=2)
        path.set_points_smoothly([
            axes.c2p(3.0, f(3.0)),
            axes.c2p(x, f(x)),
        ])
        self.play(Create(path), run_time=1)
        self.wait(0.5)

        # Update step formula
        self.play(FadeOut(VGroup(axes, graph, loss_label, param_label,
                                  dot, path, title)))
        update = MathTex(
            r"\theta_{t+1} = \theta_t - \eta \nabla_\theta L(\theta_t)",
            font_size=42,
            color=BLUE,
        )
        self.play(Write(update))
        self.wait(1.5)


class LossLandscape(Scene):
    """2D loss landscape with gradient vectors."""

    def construct(self):
        title = Text("损失景观", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Surface: f(x,y) = x^2 + 2y^2
        surface = Surface(
            lambda u, v: np.array([u, v, u ** 2 + 2 * v ** 2]),
            u_range=[-2, 2],
            v_range=[-2, 2],
            color=BLUE,
            checkerboard_colors=[BLUE_D, BLUE_E],
            resolution=(20, 20),
        )
        surface.scale(1.2)
        surface.shift(DOWN * 0.3 + RIGHT * 0.3)
        surface.rotate(PI / 6, axis=RIGHT)
        self.play(Create(surface, run_time=3))
        self.wait(0.5)

        # Gradient vector at a point
        start = np.array([-1.5, -1.2, 0])
        # Gradient of x^2 + 2y^2 at (-1.5, -1.2) = (2x, 4y) = (-3, -4.8)
        grad = np.array([-3.0, -4.8, 0])
        grad = grad / np.linalg.norm(grad) * 0.8  # normalize

        point_3d = np.array([start[0], start[1], start[0] ** 2 + 2 * start[1] ** 2])
        arrow_3d = np.array([-grad[0], -grad[1], 0])  # negative gradient direction

        dot_point = Dot3D(point_3d, color=RED)
        arrow_vec = Arrow3D(
            start=point_3d,
            end=point_3d + arrow_3d * 0.5,
            color=YELLOW,
        )
        self.play(FadeIn(dot_point), Create(arrow_vec))
        self.wait(1)

        # Formula
        self.play(FadeOut(VGroup(surface, dot_point, arrow_vec, title)))
        formula = MathTex(
            r"\theta^* = \arg\min_\theta L(\theta)",
            font_size=42,
            color=BLUE,
        )
        formula2 = MathTex(
            r"\nabla_\theta L = \left[\frac{\partial L}{\partial\theta_1},"
            r"\frac{\partial L}{\partial\theta_2},\ldots\right]^T",
            font_size=32,
            color=GRAY,
        )
        fg = VGroup(formula, formula2).arrange(DOWN, buff=0.4)
        self.play(Write(fg))
        self.wait(1.5)


class BackpropagationChain(Scene):
    """Visualize chain rule through a simple network."""

    def construct(self):
        title = Text("反向传播: 链式法则", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Network: x → h = wx+b → a = σ(h) → L = (a-y)^2
        layers = VGroup()
        labels = ["x", "w", r"h=wx+b", r"a=\sigma(h)", r"L=(a-y)^2"]
        colors_list = [BLUE, GREEN, YELLOW, ORANGE, RED]

        for i, (label, color) in enumerate(zip(labels, colors_list)):
            box = Rectangle(width=1.5, height=0.8, color=color)
            text = MathTex(label, font_size=22, color=color)
            group = VGroup(box, text)
            layers.add(group)

        layers.arrange(RIGHT, buff=0.8)
        layers.shift(DOWN * 0.5)
        self.play(LaggedStart(*[Write(l) for l in layers], lag_ratio=0.3))
        self.wait(0.5)

        # Forward arrows
        fwd_arrows = VGroup()
        for i in range(len(layers) - 1):
            arrow = Arrow(
                layers[i].get_right(),
                layers[i + 1].get_left(),
                color=BLUE,
                stroke_width=2,
            )
            fwd_arrows.add(arrow)

        fwd_label = Text("前向传播", font_size=20, color=BLUE)
        fwd_label.next_to(fwd_arrows, UP, buff=0.2)
        self.play(
            LaggedStart(*[GrowArrow(a) for a in fwd_arrows], lag_ratio=0.2),
            Write(fwd_label),
        )
        self.wait(0.5)

        # Backward arrows
        bkwd_arrows = VGroup()
        for i in range(len(layers) - 1, 0, -1):
            arrow = Arrow(
                layers[i].get_left(),
                layers[i - 1].get_right(),
                color=RED,
                stroke_width=2,
            )
            bkwd_arrows.add(arrow)

        bkwd_label = Text("反向传播", font_size=20, color=RED)
        bkwd_label.next_to(bkwd_arrows, DOWN, buff=0.2)
        self.play(
            LaggedStart(*[GrowArrow(a) for a in bkwd_arrows], lag_ratio=0.2),
            Write(bkwd_label),
        )

        # Chain rule formula
        self.play(FadeOut(VGroup(
            layers, fwd_arrows, fwd_label,
            bkwd_arrows, bkwd_label, title,
        )))
        chain = MathTex(
            r"\frac{\partial L}{\partial w} = "
            r"\frac{\partial L}{\partial a} \cdot "
            r"\frac{\partial a}{\partial h} \cdot "
            r"\frac{\partial h}{\partial w}",
            font_size=38,
            color=BLUE,
        )
        self.play(Write(chain))
        self.wait(1.5)
