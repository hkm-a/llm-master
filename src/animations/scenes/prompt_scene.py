"""Manim scenes: Prompt engineering concepts."""

from manim import *
import numpy as np

__all__ = ["PromptEngineering", "ChainOfThought"]


class PromptEngineering(Scene):
    """Explain different prompting techniques."""

    def construct(self):
        title = Text("Prompt 工程", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Zero-shot
        zero_shot = Text("Zero-shot: 直接下指令", font_size=20, color=YELLOW)
        zero_shot.shift(UP * 1.5)
        self.play(Write(zero_shot))

        zero_example = Text('"翻译成英文: 今天天气很好"', font_size=16, color=WHITE)
        zero_example.shift(UP * 0.8)
        self.play(Write(zero_example))

        # Few-shot
        few_shot = Text("Few-shot: 给几个示例", font_size=20, color=YELLOW)
        few_shot.shift(UP * 0)
        self.play(Write(few_shot))

        few_examples = VGroup(
            Text("评论: 太棒了! → 正面", font_size=14, color=GREEN),
            Text("评论: 很差 → 负面", font_size=14, color=GREEN),
            Text("评论: 还行 → ?", font_size=14, color=WHITE),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT)
        few_examples.shift(DOWN * 0.8)
        self.play(LaggedStart(*[FadeIn(e) for e in few_examples], lag_ratio=0.3))

        # Chain of Thought
        cot = Text("思维链: 让模型展示推理过程", font_size=20, color=YELLOW)
        cot.shift(DOWN * 1.8)
        self.play(Write(cot))

        cot_example = VGroup(
            Text("问题: 5+3-2=?", font_size=14, color=WHITE),
            Text("推理: 5+3=8, 8-2=6", font_size=14, color=GREEN),
            Text("答案: 6", font_size=14, color=GREEN),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT)
        cot_example.shift(DOWN * 2.8)
        self.play(LaggedStart(*[FadeIn(e) for e in cot_example], lag_ratio=0.3))

        # Best practices
        practices = Text("关键: 任务明确 + 给足上下文 + 用示例", font_size=18, color=ORANGE)
        practices.shift(DOWN * 3.5)
        self.play(Write(practices))
        self.wait(2)


class ChainOfThought(Scene):
    """Explain Chain of Thought prompting."""

    def construct(self):
        title = Text("思维链 (CoT)", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Show the problem
        problem = Text("直接回答容易出错", font_size=20, color=RED)
        problem.shift(UP * 1.5)
        self.play(Write(problem))

        # Show wrong approach
        wrong = VGroup(
            Text("问题: 小明有5个苹果, 给了小红2个, 又买了3个", font_size=16, color=WHITE),
            Text("直接回答: 8个 (错误!)", font_size=16, color=RED),
        ).arrange(DOWN, buff=0.2)
        wrong.shift(UP * 0.5)
        self.play(LaggedStart(*[FadeIn(w) for w in wrong], lag_ratio=0.3))

        # Show CoT approach
        cot = Text("思维链: 一步步推理", font_size=20, color=GREEN)
        cot.shift(DOWN * 0.5)
        self.play(Write(cot))

        steps = VGroup(
            Text("1. 初始: 5个苹果", font_size=16, color=WHITE),
            Text("2. 给了小红2个: 5-2=3个", font_size=16, color=GREEN),
            Text("3. 又买了3个: 3+3=6个", font_size=16, color=GREEN),
            Text("答案: 6个 (正确!)", font_size=16, color=GREEN),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        steps.shift(DOWN * 2)
        self.play(LaggedStart(*[FadeIn(s) for s in steps], lag_ratio=0.3))

        # Show benefit
        benefit = Text("准确率大幅提升!", font_size=24, color=GREEN)
        benefit.shift(DOWN * 3)
        self.play(Write(benefit))
        self.wait(2)
