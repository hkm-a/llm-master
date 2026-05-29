"""Manim scenes: Scaling laws and pre-training concepts."""

from manim import *
import numpy as np

__all__ = ["ScalingLaws", "PretrainFinetune"]


class ScalingLaws(Scene):
    """Explain scaling laws: bigger model + more data = better performance."""

    def construct(self):
        title = Text("规模化定律", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Show three factors
        factors = VGroup(
            Text("模型大小 N", font_size=24, color=RED),
            Text("数据量 D", font_size=24, color=GREEN),
            Text("计算量 C", font_size=24, color=BLUE),
        ).arrange(RIGHT, buff=1)
        factors.shift(UP * 1.5)
        self.play(LaggedStart(*[FadeIn(f) for f in factors], lag_ratio=0.3))

        # Show power law relationship
        formula = MathTex(
            r"L(N) = \left(\frac{N_c}{N}\right)^{\alpha_N}",
            font_size=36,
            color=YELLOW,
        )
        formula.shift(ORIGIN)
        self.play(Write(formula))

        # Explain meaning
        meaning = Text("损失与参数量呈幂律关系", font_size=20, color=GRAY)
        meaning.shift(DOWN * 1)
        self.play(Write(meaning))

        # Show the key insight
        insight = Text("更大的模型 + 更多的数据 = 更好的性能", font_size=24, color=GREEN)
        insight.shift(DOWN * 2)
        self.play(Write(insight))

        # Show Chinchilla correction
        chinchilla = Text("Chinchilla 定律: 模型和数据要匹配", font_size=20, color=ORANGE)
        chinchilla.shift(DOWN * 3)
        self.play(Write(chinchilla))
        self.wait(2)


class PretrainFinetune(Scene):
    """Explain pre-training + fine-tuning paradigm."""

    def construct(self):
        title = Text("预训练 + 微调", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Pre-training phase
        pretrain_text = Text("阶段1: 预训练", font_size=24, color=YELLOW)
        pretrain_text.shift(UP * 1.5)
        self.play(Write(pretrain_text))

        # Show data source
        data_source = Rectangle(width=4, height=1, color=GREEN, fill_opacity=0.2)
        data_source.shift(LEFT * 3)
        data_label = Text("互联网文本", font_size=18, color=WHITE)
        data_label.move_to(data_source)
        self.play(Create(data_source), Write(data_label))

        # Show model
        model_box = Rectangle(width=2, height=1, color=BLUE, fill_opacity=0.2)
        model_box.shift(RIGHT * 3)
        model_label = Text("LLM", font_size=18, color=WHITE)
        model_label.move_to(model_box)
        self.play(Create(model_box), Write(model_label))

        # Arrow
        arrow1 = Arrow(data_source.get_right(), model_box.get_left(), color=WHITE)
        self.play(GrowArrow(arrow1))

        # Fine-tuning phase
        finetune_text = Text("阶段2: 微调", font_size=24, color=ORANGE)
        finetune_text.shift(DOWN * 0.5)
        self.play(Write(finetune_text))

        # Show task data
        task_data = Rectangle(width=3, height=0.8, color=ORANGE, fill_opacity=0.2)
        task_data.shift(LEFT * 3 + DOWN * 1.5)
        task_label = Text("任务数据", font_size=16, color=WHITE)
        task_label.move_to(task_data)
        self.play(Create(task_data), Write(task_label))

        # Show specialized model
        spec_model = Rectangle(width=2, height=0.8, color=GREEN, fill_opacity=0.2)
        spec_model.shift(RIGHT * 3 + DOWN * 1.5)
        spec_label = Text("专用模型", font_size=16, color=WHITE)
        spec_label.move_to(spec_model)
        self.play(Create(spec_model), Write(spec_label))

        # Arrow
        arrow2 = Arrow(task_data.get_right(), spec_model.get_left(), color=WHITE)
        self.play(GrowArrow(arrow2))

        # Show analogy
        analogy = Text("就像: 先广泛阅读, 再参加具体考试", font_size=20, color=GRAY)
        analogy.shift(DOWN * 2.5)
        self.play(Write(analogy))
        self.wait(2)
