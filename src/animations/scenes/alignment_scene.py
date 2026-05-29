"""Manim scenes: Alignment and RLHF concepts."""

from manim import *
import numpy as np

__all__ = ["RLHFAlignment", "DPOAlignment"]


class RLHFAlignment(Scene):
    """Explain RLHF: Reinforcement Learning from Human Feedback."""

    def construct(self):
        title = Text("RLHF: 人类反馈强化学习", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Step 1: Generate multiple responses
        step1 = Text("1. 模型生成多个回答", font_size=20, color=YELLOW)
        step1.shift(UP * 1.5)
        self.play(Write(step1))

        responses = VGroup(
            Text("回答A: 中国的首都是北京", font_size=18, color=GREEN),
            Text("回答B: 北京是中国的首都", font_size=18, color=GREEN),
            Text("回答C: 首都是北京", font_size=18, color=GREEN),
        ).arrange(DOWN, buff=0.2)
        responses.shift(UP * 0.5)
        self.play(LaggedStart(*[FadeIn(r) for r in responses], lag_ratio=0.3))

        # Step 2: Human ranking
        step2 = Text("2. 人类标注哪个更好", font_size=20, color=YELLOW)
        step2.shift(DOWN * 0.5)
        self.play(Write(step2))

        ranking = VGroup(
            Text("A > B > C", font_size=18, color=ORANGE),
        ).arrange(DOWN, buff=0.2)
        ranking.shift(DOWN * 1)
        self.play(Write(ranking))

        # Step 3: Train reward model
        step3 = Text("3. 训练奖励模型", font_size=20, color=YELLOW)
        step3.shift(DOWN * 1.5)
        self.play(Write(step3))

        reward_box = Rectangle(width=4, height=0.8, color=BLUE, fill_opacity=0.2)
        reward_box.shift(DOWN * 2)
        reward_label = Text("奖励模型: 模拟人类判断", font_size=16, color=WHITE)
        reward_label.move_to(reward_box)
        self.play(Create(reward_box), Write(reward_label))

        # Step 4: Optimize with PPO
        step4 = Text("4. 用PPO优化模型", font_size=20, color=YELLOW)
        step4.shift(DOWN * 2.5)
        self.play(Write(step4))

        ppo_text = Text("让模型生成更高奖励的回答", font_size=16, color=GREEN)
        ppo_text.shift(DOWN * 3)
        self.play(Write(ppo_text))

        # Show result
        result = Text("结果: 更有用、更安全的模型", font_size=20, color=GREEN)
        result.shift(DOWN * 3.5)
        self.play(Write(result))
        self.wait(2)


class DPOAlignment(Scene):
    """Explain DPO: Direct Preference Optimization."""

    def construct(self):
        title = Text("DPO: 直接偏好优化", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Compare with RLHF
        compare_text = Text("比 RLHF 更简单!", font_size=24, color=ORANGE)
        compare_text.shift(UP * 1.5)
        self.play(Write(compare_text))

        # Show the key idea
        idea = Text("核心思想: 直接从偏好数据学习", font_size=20, color=WHITE)
        idea.shift(UP * 0.5)
        self.play(Write(idea))

        # Show preference pairs
        pairs = VGroup(
            Text("好的回答 vs 差的回答", font_size=18, color=GREEN),
            Text("→ 训练模型给好的回答更高概率", font_size=18, color=GREEN),
        ).arrange(DOWN, buff=0.2)
        pairs.shift(DOWN * 0.5)
        self.play(LaggedStart(*[FadeIn(p) for p in pairs], lag_ratio=0.3))

        # Show advantages
        advantages = VGroup(
            Text("✓ 不需要单独的奖励模型", font_size=18, color=GREEN),
            Text("✓ 训练更简单", font_size=18, color=GREEN),
            Text("✓ 训练更稳定", font_size=18, color=GREEN),
            Text("✓ 不需要强化学习", font_size=18, color=GREEN),
        ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        advantages.shift(DOWN * 1.5)
        self.play(LaggedStart(*[FadeIn(a) for a in advantages], lag_ratio=0.2))

        # Show formula
        formula = MathTex(
            r"\mathcal{L}_{DPO} = -\log\sigma\left(\beta\log\frac{\pi_\theta(y_w|x)}{\pi_{ref}(y_w|x)} - \beta\log\frac{\pi_\theta(y_l|x)}{\pi_{ref}(y_l|x)}\right)",
            font_size=24,
            color=YELLOW,
        )
        formula.shift(DOWN * 2.5)
        self.play(Write(formula))
        self.wait(2)
