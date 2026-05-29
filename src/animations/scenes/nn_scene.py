"""Manim scenes: Neural network forward pass visualization."""

from manim import *
import numpy as np

__all__ = ["NeuralNetworkForward", "ActivationFunctions"]


class NeuralNetworkForward(Scene):
    """Visualize a simple neural network forward pass."""

    def construct(self):
        title = Text("神经网络: 一层一层往前算", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Network layers
        layer_sizes = [3, 4, 4, 2]
        layer_names = ["输入", "隐藏1", "隐藏2", "输出"]
        layer_colors = [BLUE, GREEN, YELLOW, RED]

        layers = VGroup()
        all_neurons = []

        for i, (size, name, color) in enumerate(zip(layer_sizes, layer_names, layer_colors)):
            neurons = VGroup()
            for j in range(size):
                neuron = Circle(radius=0.2, color=color, fill_opacity=0.3)
                neurons.add(neuron)
            neurons.arrange(DOWN, buff=0.4)

            label = Text(name, font_size=16, color=color)
            label.next_to(neurons, UP, buff=0.3)

            layer = VGroup(neurons, label)
            layers.add(layer)
            all_neurons.append(neurons)

        layers.arrange(RIGHT, buff=1.5)
        layers.shift(DOWN * 0.3)
        self.play(LaggedStart(*[FadeIn(l) for l in layers], lag_ratio=0.3))
        self.wait(0.5)

        # Connections (weights)
        weights = VGroup()
        for i in range(len(all_neurons) - 1):
            for n1 in all_neurons[i]:
                for n2 in all_neurons[i + 1]:
                    line = Line(
                        n1.get_right(),
                        n2.get_left(),
                        stroke_width=0.5,
                        color=GRAY,
                        stroke_opacity=0.4,
                    )
                    weights.add(line)

        self.play(LaggedStart(*[FadeIn(w) for w in weights[:20]], lag_ratio=0.05))
        self.wait(0.5)

        # Highlight forward pass
        for i in range(len(all_neurons) - 1):
            highlight = VGroup()
            for n1 in all_neurons[i]:
                for n2 in all_neurons[i + 1]:
                    line = Line(
                        n1.get_right(),
                        n2.get_left(),
                        stroke_width=2,
                        color=YELLOW,
                    )
                    highlight.add(line)

            self.play(
                *[Create(l) for l in highlight[:8]],
                run_time=0.5,
            )
            self.wait(0.3)

        # Formula
        self.play(FadeOut(VGroup(layers, weights, title)))
        formula = MathTex(
            r"y = W_3 \cdot \sigma(W_2 \cdot \sigma(W_1 \cdot x + b_1) + b_2) + b_3",
            font_size=28,
            color=BLUE,
        )
        meaning = Text(
            "每层: 矩阵乘法 + 激活函数",
            font_size=22,
            color=GRAY,
        )
        group = VGroup(formula, meaning).arrange(DOWN, buff=0.3)
        self.play(Write(formula), Write(meaning))
        self.wait(2)


class ActivationFunctions(Scene):
    """Compare common activation functions."""

    def construct(self):
        title = Text("激活函数: 引入非线性", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Three axes side by side
        configs = [
            ("Sigmoid", lambda x: 1 / (1 + np.exp(-x)), [-6, 6], [0, 1], GREEN),
            ("ReLU", lambda x: max(0, x), [-3, 3], [-0.5, 3], ORANGE),
            ("GELU", lambda x: 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3))), [-3, 3], [-0.5, 3], PURPLE),
        ]

        axes_group = VGroup()
        for i, (name, func, x_range, y_range, color) in enumerate(configs):
            ax = Axes(
                x_range=[x_range[0], x_range[1], 1],
                y_range=[y_range[0], y_range[1], 0.5],
                x_length=3,
                y_length=2.5,
                axis_config={"color": WHITE, "include_numbers": False},
            )
            graph = ax.plot(func, x_range=[x_range[0] + 0.1, x_range[1] - 0.1], color=color)
            label = Text(name, font_size=20, color=color)
            label.next_to(ax, UP, buff=0.2)
            axes_group.add(VGroup(ax, graph, label))

        axes_group.arrange(RIGHT, buff=0.8)
        axes_group.shift(DOWN * 0.5)
        self.play(LaggedStart(*[FadeIn(a) for a in axes_group], lag_ratio=0.3))
        self.wait(2)
