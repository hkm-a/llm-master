import type { Chapter, ContentIndex } from "./types";

export const chapters: Chapter[] = [
  {
    id: "ch1",
    title: "数学基础",
    description: "线性代数、微积分、概率统计 - LLM的数学根基",
    order: 1,
    phase: "Phase 1: 基础",
    lessons: [
      { id: "ch1_lesson1", order: 1, title: "线性代数基础", description: "矩阵、向量、特征值分解", difficulty: "medium" },
      { id: "ch1_lesson2", order: 2, title: "微积分基础", description: "梯度、链式法则、反向传播", difficulty: "medium" },
    ],
    resources: {
      papers: [],
      blogs: ["https://www.3blue1brown.com/topics/linear-algebra"],
      github: [],
      books: [],
    },
  },
  {
    id: "ch2",
    title: "深度学习基础",
    description: "神经网络、反向传播、优化器 - 理解模型训练原理",
    order: 2,
    phase: "Phase 1: 基础",
    lessons: [
      { id: "ch2_lesson1", order: 1, title: "神经网络入门", description: "感知器、激活函数", difficulty: "easy" },
      { id: "ch2_lesson2", order: 2, title: "反向传播", description: "梯度下降、优化器", difficulty: "hard" },
    ],
    resources: {
      papers: [],
      blogs: ["https://colah.github.io/posts/2015-08-Backprop/"],
      github: ["https://github.com/karpathy/nn-spiral"],
      books: [],
    },
  },
  {
    id: "ch3",
    title: "NLP基础",
    description: "词嵌入、RNN/LSTM/GRU - 自然语言处理入门",
    order: 3,
    phase: "Phase 1: 基础",
    lessons: [
      { id: "ch3_lesson1", order: 1, title: "词嵌入", description: "Word2Vec、GloVe", difficulty: "medium" },
      { id: "ch3_lesson2", order: 2, title: "序列模型", description: "RNN、LSTM、GRU", difficulty: "medium" },
    ],
    resources: {
      papers: [],
      blogs: ["https://jalammar.github.io/illustrated-word2vec/"],
      github: [],
      books: [],
    },
  },
  {
    id: "ch4",
    title: "Transformer架构",
    description: "注意力机制、位置编码、Encoder-Decoder - LLM的核心架构",
    order: 4,
    phase: "Phase 2: 核心架构",
    lessons: [
      { id: "ch4_lesson1", order: 1, title: "自注意力机制", description: "QKV计算、注意力权重", difficulty: "hard" },
      { id: "ch4_lesson2", order: 2, title: "Transformer结构", description: "Encoder、Decoder、Multi-Head", difficulty: "hard" },
    ],
    resources: {
      papers: ["https://arxiv.org/abs/1706.03762"],
      blogs: [
        "https://jalammar.github.io/illustrated-transformer/",
        "https://jalammar.github.io/illustrated-gpt2/",
      ],
      github: ["https://github.com/karpathy/nanogpt"],
      books: [],
    },
  },
  {
    id: "ch5",
    title: "预训练技术",
    description: "语言模型目标、规模化定律、数据处理 - 如何训练大模型",
    order: 5,
    phase: "Phase 2: 核心架构",
    lessons: [
      { id: "ch5_lesson1", order: 1, title: "语言模型目标", description: "因果LM、掩码LM", difficulty: "medium" },
      { id: "ch5_lesson2", order: 2, title: "规模化定律", description: "模型大小、数据量、训练步数", difficulty: "medium" },
    ],
    resources: {
      papers: ["https://arxiv.org/abs/2001.08361"],
      blogs: ["https://lilianweng.github.io/posts/2019-01-31-lm/"],
      github: [],
      books: [],
    },
  },
  {
    id: "ch6",
    title: "主流LLM架构",
    description: "GPT系列、LLaMA、Mistral/Mixtral、多模态 - 了解主流模型设计",
    order: 6,
    phase: "Phase 2: 核心架构",
    lessons: [
      { id: "ch6_lesson1", order: 1, title: "GPT系列", description: "从GPT-1到GPT-4", difficulty: "medium" },
      { id: "ch6_lesson2", order: 2, title: "开源LLM", description: "LLaMA、Mistral、Mixtral", difficulty: "medium" },
    ],
    resources: {
      papers: [
        "https://arxiv.org/abs/2005.14165",
        "https://arxiv.org/abs/2302.13971",
      ],
      blogs: [],
      github: ["https://github.com/meta-llama/llama"],
      books: [],
    },
  },
  {
    id: "ch7",
    title: "模型微调",
    description: "全量微调、LoRA、QLoRA、RLHF、DPO - 定制化你的模型",
    order: 7,
    phase: "Phase 3: 工程实践",
    lessons: [
      { id: "ch7_lesson1", order: 1, title: "参数高效微调", description: "LoRA、QLoRA、Adapter", difficulty: "medium" },
      { id: "ch7_lesson2", order: 2, title: "对齐技术", description: "RLHF、DPO、PPO", difficulty: "hard" },
    ],
    resources: {
      papers: [
        "https://arxiv.org/abs/2106.09685",
        "https://arxiv.org/abs/2305.14314",
      ],
      blogs: ["https://huggingface.co/blog/rlhf"],
      github: ["https://github.com/unslothai/unsloth"],
      books: [],
    },
  },
  {
    id: "ch8",
    title: "量化与部署",
    description: "量化原理、GGUF、GPTQ、vLLM - 高效运行大模型",
    order: 8,
    phase: "Phase 3: 工程实践",
    lessons: [
      { id: "ch8_lesson1", order: 1, title: "模型量化", description: "4-bit、8-bit量化", difficulty: "medium" },
      { id: "ch8_lesson2", order: 2, title: "推理优化", description: "vLLM、TensorRT-LLM", difficulty: "hard" },
    ],
    resources: {
      papers: [],
      blogs: [],
      github: [
        "https://github.com/ggerganov/llama.cpp",
        "https://github.com/vllm-project/vllm",
      ],
      books: [],
    },
  },
  {
    id: "ch9",
    title: "应用开发",
    description: "Prompt工程、RAG、LangChain、Agent - 构建LLM应用",
    order: 9,
    phase: "Phase 3: 工程实践",
    lessons: [
      { id: "ch9_lesson1", order: 1, title: "Prompt工程", description: "提示词技巧、思维链", difficulty: "easy" },
      { id: "ch9_lesson2", order: 2, title: "RAG与Agent", description: "检索增强、工具调用", difficulty: "medium" },
    ],
    resources: {
      papers: [],
      blogs: [],
      github: [
        "https://github.com/langchain-ai/langchain",
        "https://github.com/run-llama/llama_index",
      ],
      books: [],
    },
  },
];

export const contentIndex: ContentIndex = {
  chapters,
  totalLessons: chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
  animatedLessons: [],
};

export function getChapterById(id: string): Chapter | undefined {
  return chapters.find((ch) => ch.id === id);
}

export function getChaptersByPhase(phase: Chapter["phase"]): Chapter[] {
  return chapters.filter((ch) => ch.phase === phase);
}