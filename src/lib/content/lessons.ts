import type { DerivationStep } from "@/types";

export interface LessonContent {
  derivationSteps: DerivationStep[];
  bodyText: string;
  backLink: {
    chapterId: string;
    chapterTitle: string;
  };
}

const attentionDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "输入序列",
    formula:
      "X = \\begin{bmatrix} x_1 \\\\ x_2 \\\\ \\vdots \\\\ x_n \\end{bmatrix} \\in \\mathbb{R}^{n \\times d}",
    explanation:
      "假设我们有一个输入序列 X，包含 n 个 token，每个 token 的维度为 d。",
  },
  {
    stepNumber: 2,
    title: "计算 Query、Key、Value",
    formula:
      "Q = X \\cdot W_Q, \\quad K = X \\cdot W_K, \\quad V = X \\cdot W_V",
    explanation:
      "通过线性变换将输入转换为 Query、Key、Value 矩阵。这些变换矩阵 W_Q、W_K、W_V 是模型需要学习的参数。",
  },
  {
    stepNumber: 3,
    title: "计算注意力分数",
    formula:
      "Attention(Q,K) = \\frac{Q \\cdot K^T}{\\sqrt{d_k}}",
    explanation:
      "计算每个 Query 与所有 Key 的相似度分数，除以 \\sqrt{d_k} 进行缩放，防止梯度消失。",
    animation: { type: "attention" },
  },
  {
    stepNumber: 4,
    title: "Softmax归一化",
    formula:
      "\\text{Softmax}(x_i) = \\frac{e^{x_i}}{\\sum_{j=1}^n e^{x_j}}",
    explanation:
      "对注意力分数应用 Softmax 函数，使其归一化为概率分布，确保所有权重之和为 1。",
  },
  {
    stepNumber: 5,
    title: "加权求和",
    formula:
      "\\text{Output} = \\text{Softmax}\\left(\\frac{Q \\cdot K^T}{\\sqrt{d_k}}\\right) \\cdot V",
    explanation:
      "使用注意力权重对 Value 矩阵进行加权求和，得到最终的注意力输出。",
  },
];

const backpropDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "损失函数",
    formula:
      "L = -\\frac{1}{N} \\sum_{i=1}^N \\log(p(y_i | x_i))",
    explanation: "交叉熵损失函数，衡量模型预测与真实标签之间的差距。",
  },
  {
    stepNumber: 2,
    title: "梯度计算",
    formula:
      "\\frac{\\partial L}{\\partial W} = \\frac{\\partial L}{\\partial y} \\cdot \\frac{\\partial y}{\\partial z} \\cdot \\frac{\\partial z}{\\partial W}",
    explanation:
      "使用链式法则计算损失函数对权重的梯度。",
    animation: { type: "gradient" },
  },
  {
    stepNumber: 3,
    title: "反向传播",
    formula:
      "\\Delta W = -\\eta \\cdot \\frac{\\partial L}{\\partial W}",
    explanation:
      "根据梯度更新权重，\\eta 是学习率。",
  },
];

const loraDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "原始权重",
    formula: "W \\in \\mathbb{R}^{m \\times n}",
    explanation: "假设原始模型权重矩阵 W 的维度为 m × n。",
  },
  {
    stepNumber: 2,
    title: "低秩分解",
    formula:
      "W = W_0 + A \\cdot B, \\quad A \\in \\mathbb{R}^{m \\times r}, \\quad B \\in \\mathbb{R}^{r \\times n}",
    explanation:
      "将权重更新分解为两个低秩矩阵 A 和 B 的乘积，其中 r << min(m,n)。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 3,
    title: "参数效率",
    formula:
      "\\text{参数数量: } m \\times r + r \\times n << m \\times n",
    explanation:
      "LoRA 只训练 A 和 B，大大减少了需要更新的参数数量。",
  },
];

/**
 * Lesson content registry — maps lesson IDs to their derivation steps and content.
 * Add new entries here when new lessons are added to chapters.ts.
 */
export const lessonContent: Partial<Record<string, LessonContent>> = {
  ch4_lesson1: {
    derivationSteps: attentionDerivationSteps,
    bodyText:
      "自注意力机制是 Transformer 架构的核心创新。它允许模型在处理每个位置时，关注输入序列中所有位置的信息，从而更好地捕捉长距离依赖关系。",
    backLink: { chapterId: "ch4", chapterTitle: "Transformer架构" },
  },
  ch2_lesson2: {
    derivationSteps: backpropDerivationSteps,
    bodyText:
      "反向传播是深度学习的核心算法，通过计算损失函数对模型参数的梯度，然后使用梯度下降法更新参数，使模型逐渐收敛到最优解。",
    backLink: { chapterId: "ch2", chapterTitle: "深度学习基础" },
  },
  ch7_lesson1: {
    derivationSteps: loraDerivationSteps,
    bodyText:
      "LoRA (Low-Rank Adaptation) 是一种参数高效的微调方法，通过冻结原始模型权重，只训练低秩矩阵来适配特定任务，大大减少了训练成本。",
    backLink: { chapterId: "ch7", chapterTitle: "模型微调" },
  },
};

export function getLessonContent(id: string): LessonContent | undefined {
  return lessonContent[id];
}
