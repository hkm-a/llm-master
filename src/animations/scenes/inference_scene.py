"""Manim scenes: Inference optimization concepts."""

from manim import *
import numpy as np

__all__ = ["KVCacheOptimization", "PagedAttention"]


class KVCacheOptimization(Scene):
    """Explain KV-Cache for faster inference."""

    def construct(self):
        title = Text("KV-Cache: 缓存历史计算", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Show the problem
        problem = Text("问题: 每生成一个词都要重新计算所有历史", font_size=20, color=RED)
        problem.shift(UP * 1.5)
        self.play(Write(problem))

        # Show traditional approach
        traditional = Text("传统方法: O(t²) 复杂度", font_size=18, color=RED)
        traditional.shift(UP * 0.5)
        self.play(Write(traditional))

        # Show KV-Cache solution
        solution = Text("KV-Cache: 缓存历史的 K 和 V", font_size=20, color=GREEN)
        solution.shift(DOWN * 0.5)
        self.play(Write(solution))

        # Show the process
        step1 = Text("1. 计算所有词的 K, V → 存起来", font_size=16, color=WHITE)
        step1.shift(DOWN * 1.5)
        self.play(Write(step1))

        step2 = Text("2. 新词只需要计算自己的 Q, K, V", font_size=16, color=WHITE)
        step2.shift(DOWN * 2)
        self.play(Write(step2))

        step3 = Text("3. 和缓存的 K, V 做注意力", font_size=16, color=WHITE)
        step3.shift(DOWN * 2.5)
        self.play(Write(step3))

        # Show improvement
        improvement = Text("复杂度: O(t²) → O(t)", font_size=24, color=GREEN)
        improvement.shift(DOWN * 3)
        self.play(Write(improvement))

        # Show trade-off
        tradeoff = Text("缺点: 需要大量显存", font_size=18, color=ORANGE)
        tradeoff.shift(DOWN * 3.5)
        self.play(Write(tradeoff))
        self.wait(2)


class PagedAttention(Scene):
    """Explain PagedAttention: efficient memory management."""

    def construct(self):
        title = Text("PagedAttention: 显存管理创新", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Show traditional problem
        traditional_text = Text("传统方法: 预分配最大长度", font_size=20, color=RED)
        traditional_text.shift(UP * 1.5)
        self.play(Write(traditional_text))

        # Show waste
        waste = VGroup(
            Text("实际使用: 100 tokens", font_size=18, color=GREEN),
            Text("预分配: 4096 tokens", font_size=18, color=RED),
            Text("浪费: 97% 显存!", font_size=18, color=RED),
        ).arrange(DOWN, buff=0.2)
        waste.shift(UP * 0.5)
        self.play(LaggedStart(*[FadeIn(w) for w in waste], lag_ratio=0.3))

        # Show PagedAttention solution
        paged_text = Text("PagedAttention: 按需分配", font_size=20, color=GREEN)
        paged_text.shift(DOWN * 1)
        self.play(Write(paged_text))

        # Show pages
        pages = VGroup(
            Rectangle(width=1, height=0.5, color=BLUE, fill_opacity=0.2),
            Rectangle(width=1, height=0.5, color=BLUE, fill_opacity=0.2),
            Rectangle(width=1, height=0.5, color=BLUE, fill_opacity=0.2),
            Rectangle(width=1, height=0.5, color=GRAY, fill_opacity=0.2),
            Rectangle(width=1, height=0.5, color=GRAY, fill_opacity=0.2),
        ).arrange(RIGHT, buff=0.1)
        pages.shift(DOWN * 2)
        self.play(LaggedStart(*[Create(p) for p in pages], lag_ratio=0.2))

        page_labels = VGroup(
            Text("页1", font_size=14, color=WHITE),
            Text("页2", font_size=14, color=WHITE),
            Text("页3", font_size=14, color=WHITE),
            Text("空闲", font_size=14, color=GRAY),
            Text("空闲", font_size=14, color=GRAY),
        ).arrange(RIGHT, buff=0.1)
        page_labels.shift(DOWN * 2.5)
        self.play(LaggedStart(*[FadeIn(l) for l in page_labels], lag_ratio=0.2))

        # Show benefit
        benefit = Text("显存利用率提升 4 倍!", font_size=24, color=GREEN)
        benefit.shift(DOWN * 3)
        self.play(Write(benefit))
        self.wait(2)
