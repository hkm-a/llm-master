"""Manim scenes: RAG and Agent concepts."""

from manim import *
import numpy as np

__all__ = ["RAGRetrieval", "AgentReAct"]


class RAGRetrieval(Scene):
    """Explain RAG: Retrieval-Augmented Generation."""

    def construct(self):
        title = Text("RAG: 检索增强生成", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # User question
        question = Text("用户提问: 2024年诺贝尔物理学奖得主是谁?", font_size=24, color=WHITE)
        question.shift(UP * 2)
        self.play(Write(question))

        # Step 1: Search
        step1 = Text("1. 搜索知识库", font_size=20, color=YELLOW)
        step1.shift(UP * 1)
        self.play(Write(step1))

        # Show search process
        search_box = Rectangle(width=6, height=1, color=YELLOW, fill_opacity=0.2)
        search_box.shift(UP * 0.5)
        search_text = Text("向量相似度搜索...", font_size=18, color=GRAY)
        search_text.move_to(search_box)
        self.play(Create(search_box), Write(search_text))

        # Found documents
        docs = VGroup(
            Text("文档1: 诺贝尔物理学奖2024", font_size=16, color=GREEN),
            Text("文档2: 物理学奖历史", font_size=16, color=GREEN),
            Text("文档3: 2024年科学突破", font_size=16, color=GREEN),
        ).arrange(DOWN, buff=0.2)
        docs.shift(ORIGIN)
        self.play(FadeIn(docs))

        # Step 2: Inject context
        step2 = Text("2. 注入上下文", font_size=20, color=YELLOW)
        step2.shift(DOWN * 1)
        self.play(Write(step2))

        # Show context injection
        context_box = Rectangle(width=6, height=1.5, color=BLUE, fill_opacity=0.2)
        context_box.shift(DOWN * 1.5)
        context_text = Text("问题 + 相关文档 → LLM", font_size=18, color=WHITE)
        context_text.move_to(context_box)
        self.play(Create(context_box), Write(context_text))

        # Step 3: Generate answer
        step3 = Text("3. 生成回答", font_size=20, color=YELLOW)
        step3.shift(DOWN * 2.5)
        self.play(Write(step3))

        answer = Text("2024年诺贝尔物理学奖得主是...", font_size=18, color=GREEN)
        answer.shift(DOWN * 3)
        self.play(Write(answer))

        # Highlight benefit
        benefit = Text("基于事实, 不会编造!", font_size=24, color=GREEN)
        benefit.shift(DOWN * 3.5)
        self.play(Write(benefit))
        self.wait(2)


class AgentReAct(Scene):
    """Explain Agent: ReAct framework."""

    def construct(self):
        title = Text("Agent: 能动手的 AI", font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))

        # Show ReAct loop
        thought = Text("Thought: 我需要查天气", font_size=20, color=YELLOW)
        thought.shift(UP * 1.5)
        self.play(Write(thought))

        action = Text("Action: 调用 get_weather('北京')", font_size=20, color=ORANGE)
        action.shift(UP * 0.5)
        self.play(Write(action))

        observation = Text("Observation: 晴, 25°C", font_size=20, color=GREEN)
        observation.shift(DOWN * 0.5)
        self.play(Write(observation))

        thought2 = Text("Thought: 现在有结果了", font_size=20, color=YELLOW)
        thought2.shift(DOWN * 1.5)
        self.play(Write(thought2))

        answer = Text("Answer: 北京今天晴, 25°C", font_size=20, color=BLUE)
        answer.shift(DOWN * 2.5)
        self.play(Write(answer))

        # Show loop arrow
        arrow = Arrow(
            answer.get_end() + DOWN * 0.3,
            thought.get_start() + UP * 0.3,
            color=WHITE,
            buff=0.2,
        )
        self.play(GrowArrow(arrow))

        loop_text = Text("思考-行动-观察 循环", font_size=18, color=GRAY)
        loop_text.shift(RIGHT * 3)
        self.play(Write(loop_text))

        # Show tools
        tools_title = Text("可用工具:", font_size=18, color=WHITE)
        tools_title.shift(DOWN * 3.5)
        self.play(Write(tools_title))

        tools = VGroup(
            Text("• 天气API", font_size=16, color=GREEN),
            Text("• 搜索引擎", font_size=16, color=GREEN),
            Text("• 代码执行", font_size=16, color=GREEN),
            Text("• 浏览器", font_size=16, color=GREEN),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT)
        tools.shift(DOWN * 4)
        self.play(FadeIn(tools))
        self.wait(2)
