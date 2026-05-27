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

// ── Phase 1: 基础 ─────────────────────────────────────────────

// ch1_lesson1 — 线性代数基础
const linearAlgebraDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "矩阵乘法定义",
    formula:
      "C_{ij} = \\sum_{k=1}^m A_{ik} \\cdot B_{kj}, \\quad A \\in \\mathbb{R}^{n \\times m}, \\, B \\in \\mathbb{R}^{m \\times p}",
    explanation:
      "矩阵乘法是线性代数的核心操作。结果矩阵 C 的每个元素是 A 的行向量与 B 的列向量的点积。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 2,
    title: "特征值与特征向量",
    formula:
      "A \\cdot v = \\lambda \\cdot v, \\quad v \\neq 0",
    explanation:
      "如果矩阵 A 作用于向量 v 后方向不变仅缩放 λ 倍，则 λ 为特征值，v 为对应的特征向量。",
  },
  {
    stepNumber: 3,
    title: "特征值分解",
    formula:
      "A = Q \\cdot \\Lambda \\cdot Q^{-1}, \\quad \\Lambda = \\text{diag}(\\lambda_1, \\dots, \\lambda_n)",
    explanation:
      "特征值分解将矩阵 A 分解为特征向量矩阵 Q 和特征值对角矩阵 Λ。这是理解矩阵本质的重要工具。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 4,
    title: "奇异值分解 (SVD)",
    formula:
      "A = U \\cdot \\Sigma \\cdot V^T, \\quad U^T U = I, \\, V^T V = I",
    explanation:
      "SVD 将任意矩阵分解为左奇异向量 U、奇异值对角矩阵 Σ 和右奇异向量 V。在降维和推荐系统中广泛应用。",
  },
];

// ch1_lesson2 — 微积分基础
const calculusDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "导数定义",
    formula:
      "f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}",
    explanation:
      "导数描述了函数在某一点的变化率，是微积分的基石。",
  },
  {
    stepNumber: 2,
    title: "偏导数",
    formula:
      "\\frac{\\partial f}{\\partial x_i} = \\lim_{h \\to 0} \\frac{f(x_1, \\dots, x_i + h, \\dots, x_n) - f(x_1, \\dots, x_n)}{h}",
    explanation:
      "偏导数衡量多元函数沿某个特定方向的变化率，其他变量视为常数。",
  },
  {
    stepNumber: 3,
    title: "链式法则",
    formula:
      "\\frac{dz}{dx} = \\frac{dz}{dy} \\cdot \\frac{dy}{dx}",
    explanation:
      "链式法则是反向传播的理论基础，它告诉我们如何计算复合函数的导数。在神经网络中，它使损失函数的梯度能够从输出层向输入层逐层传播。",
    animation: { type: "gradient" },
  },
  {
    stepNumber: 4,
    title: "梯度向量",
    formula:
      "\\nabla f = \\begin{bmatrix} \\frac{\\partial f}{\\partial x_1} & \\frac{\\partial f}{\\partial x_2} & \\cdots & \\frac{\\partial f}{\\partial x_n} \\end{bmatrix}^T",
    explanation:
      "梯度向量由所有偏导数组成，指向函数增长最快的方向。梯度下降法沿负梯度方向迭代更新参数以最小化损失函数。",
  },
];

// ch2_lesson1 — 神经网络入门
const nnBasicDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "感知器模型",
    formula:
      "y = \\phi\\left(\\sum_{i=1}^n w_i x_i + b\\right) = \\phi(w \\cdot x + b)",
    explanation:
      "感知器是神经网络的基本单元，对输入做加权求和后通过激活函数 ϕ 输出结果。",
  },
  {
    stepNumber: 2,
    title: "Sigmoid 激活函数",
    formula:
      "\\sigma(x) = \\frac{1}{1 + e^{-x}}, \\quad \\sigma'(x) = \\sigma(x)(1 - \\sigma(x))",
    explanation:
      "Sigmoid 将任意实数映射到 (0,1) 区间，适合二分类输出的概率解释。但其饱和区梯度趋近于零，易导致梯度消失。",
  },
  {
    stepNumber: 3,
    title: "ReLU 激活函数",
    formula:
      "\\text{ReLU}(x) = \\max(0, x), \\quad \\text{ReLU}'(x) = \\begin{cases} 1 & x > 0 \\\\ 0 & x \\leq 0 \\end{cases}",
    explanation:
      "ReLU 在正区间梯度恒为 1，有效缓解了梯度消失问题，且计算简单，成为现代神经网络最常用的激活函数。",
  },
  {
    stepNumber: 4,
    title: "多层感知器 (MLP)",
    formula:
      "h^{(l+1)} = \\sigma\\left(W^{(l)} \\cdot h^{(l)} + b^{(l)}\\right)",
    explanation:
      "多层感知器通过堆叠多个全连接层和非线性激活函数，使网络能够学习复杂的非线性映射。层数越多，表达能力越强。",
    animation: { type: "matrix" },
  },
];

// ch3_lesson1 — 词嵌入
const wordEmbeddingDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "One-hot 表示",
    formula:
      "\\text{One-hot}(w_i) = [0, \\dots, 0, 1, 0, \\dots, 0] \\in \\mathbb{R}^{|V|}",
    explanation:
      "One-hot 将每个词表示为词汇表大小的稀疏向量，只有一个位置为 1。这种方式无法捕捉词与词之间的语义相似性。",
  },
  {
    stepNumber: 2,
    title: "嵌入矩阵",
    formula:
      "e_w = W_E \\cdot \\text{One-hot}(w), \\quad W_E \\in \\mathbb{R}^{d \\times |V|}",
    explanation:
      "嵌入矩阵 W_E 将高维稀疏的 One-hot 向量映射到低维稠密的嵌入向量 e_w。相似的词在嵌入空间中距离更近。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 3,
    title: "Skip-gram 目标函数",
    formula:
      "\\max \\frac{1}{T} \\sum_{t=1}^T \\sum_{-c \\leq j \\leq c, j \\neq 0} \\log p(w_{t+j} | w_t)",
    explanation:
      "Skip-gram 模型用中心词 w_t 预测上下文词 w_{t+j}。通过最大化共现概率来学习高质量的词嵌入。",
  },
  {
    stepNumber: 4,
    title: "负采样 (Negative Sampling)",
    formula:
      "\\log \\sigma(v_{w_o}' \\cdot v_{w_i}) + \\sum_{k=1}^K \\mathbb{E}_{w_k \\sim P_n(w)} \\left[ \\log \\sigma(-v_{w_k}' \\cdot v_{w_i}) \\right]",
    explanation:
      "负采样将多分类问题简化为二分类：区分目标词和 K 个随机采样的负样本，大幅降低了计算复杂度。",
  },
];

// ch3_lesson2 — 序列模型
const sequenceModelDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "RNN 单元",
    formula:
      "h_t = \\tanh(W_{hh} \\cdot h_{t-1} + W_{xh} \\cdot x_t + b_h)",
    explanation:
      "RNN 在每个时间步接收当前输入 x_t 和前一时刻的隐状态 h_{t-1}，通过 tanh 激活产生新的隐状态 h_t，从而捕捉序列中的时序依赖。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 2,
    title: "隐状态递归更新",
    formula:
      "h_t = f(h_{t-1}, x_t), \\quad y_t = W_{hy} \\cdot h_t + b_y",
    explanation:
      "隐状态沿时间轴递归传递，每一步的输出 y_t 由当前隐状态通过线性变换得到。这种递归结构使 RNN 能处理任意长度的序列。",
  },
  {
    stepNumber: 3,
    title: "LSTM 门控机制",
    formula:
      "\\begin{aligned} i_t &= \\sigma(W_i \\cdot [h_{t-1}, x_t] + b_i) \\\\ f_t &= \\sigma(W_f \\cdot [h_{t-1}, x_t] + b_f) \\\\ o_t &= \\sigma(W_o \\cdot [h_{t-1}, x_t] + b_o) \\\\ c_t &= f_t \\odot c_{t-1} + i_t \\odot \\tanh(W_c \\cdot [h_{t-1}, x_t] + b_c) \\\\ h_t &= o_t \\odot \\tanh(c_t) \\end{aligned}",
    explanation:
      "LSTM 通过输入门 i_t、遗忘门 f_t 和输出门 o_t 三个门控结构控制信息流。细胞状态 c_t 使梯度能更顺畅地反向传播，有效缓解了长序列中的梯度消失问题。",
  },
  {
    stepNumber: 4,
    title: "梯度消失问题",
    formula:
      "\\frac{\\partial L}{\\partial W_{hh}} = \\sum_{t=1}^T \\frac{\\partial L_t}{\\partial h_t} \\prod_{k=2}^t \\frac{\\partial h_k}{\\partial h_{k-1}} = \\sum_{t=1}^T \\frac{\\partial L_t}{\\partial h_t} \\prod_{k=2}^t \\text{diag}(\\tanh'(h_k)) \\cdot W_{hh}",
    explanation:
      "RNN 的梯度是各时间步梯度的累积和。当时间步数增加时，若 W_{hh} 的特征值小于 1，连乘项会指数衰减至零，导致早期时间步无法学习。LSTM 的门控结构和细胞状态通过加法更新缓解了这一问题。",
  },
];

// ── Phase 2: 核心架构 ─────────────────────────────────────────

// ch4_lesson2 — Transformer结构
const transformerArchDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "Encoder-Decoder 架构",
    formula:
      "\\text{Encoder: } X \\to Z = \\text{TransformerBlock}(X), \\quad \\text{Decoder: } (Z, Y_{<t}) \\to y_t",
    explanation:
      "Transformer 采用 Encoder-Decoder 结构。Encoder 将输入序列编码为表示序列 Z，Decoder 基于 Z 和已生成的前缀逐词生成输出。",
  },
  {
    stepNumber: 2,
    title: "多头注意力 (Multi-Head)",
    formula:
      "\\text{MultiHead}(Q,K,V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) \\cdot W_O \\\\ \\text{head}_i = \\text{Attention}(Q \\cdot W_i^Q, K \\cdot W_i^K, V \\cdot W_i^V)",
    explanation:
      "多头注意力并行计算 h 组不同的注意力，每组学习不同的表示子空间。拼接后通过 W_O 投影回原始维度，使模型能关注不同位置的多种特征。",
    animation: { type: "attention" },
  },
  {
    stepNumber: 3,
    title: "层归一化 (LayerNorm)",
    formula:
      "\\text{LayerNorm}(x) = \\gamma \\odot \\frac{x - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}} + \\beta, \\quad \\mu = \\frac{1}{d}\\sum_{j=1}^d x_j, \\,\\, \\sigma^2 = \\frac{1}{d}\\sum_{j=1}^d (x_j - \\mu)^2",
    explanation:
      "LayerNorm 对每个样本的所有特征维度进行归一化，使训练更稳定。γ 和 β 是可学习的缩放和平移参数。",
  },
  {
    stepNumber: 4,
    title: "前馈网络 (FFN)",
    formula:
      "\\text{FFN}(x) = W_2 \\cdot \\text{ReLU}(W_1 \\cdot x + b_1) + b_2",
    explanation:
      "每个注意力层后接一个两层前馈网络，先升维再降维 (通常 d_ff = 4d_model)，为模型引入非线性变换能力。",
    animation: { type: "matrix" },
  },
];

// ch5_lesson1 — 语言模型目标
const lmObjectivesDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "自回归语言建模",
    formula:
      "p(x_1, x_2, \\dots, x_n) = \\prod_{t=1}^n p(x_t | x_{<t})",
    explanation:
      "自回归语言模型将序列的联合概率分解为条件概率的乘积——每个词只依赖前面已经生成的词。这是 GPT 系列模型的基本假设。",
  },
  {
    stepNumber: 2,
    title: "因果掩码 (Causal Mask)",
    formula:
      "M_{ij} = \\begin{cases} 0 & i \\geq j \\\\ -\\infty & i < j \\end{cases}, \\quad \\text{Attention}(Q,K,V) = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right) V",
    explanation:
      "因果掩码确保在训练时，每个位置只能注意到自己及之前的位置。通过将未来位置设为 -∞，Softmax 后注意力权重为零。",
  },
  {
    stepNumber: 3,
    title: "掩码语言模型 (MLM)",
    formula:
      "L_{\\text{MLM}} = -\\sum_{x \\in \\mathcal{M}} \\log p(x | \\hat{X})",
    explanation:
      "MLM 随机将输入中 15% 的 token 替换为 [MASK]，然后训练模型预测被掩盖的词。BERT 使用这种方法学习双向上下文表示。",
  },
  {
    stepNumber: 4,
    title: "下一个句子预测 (NSP)",
    formula:
      "L_{\\text{NSP}} = -\\left[ y \\log p + (1 - y) \\log(1 - p) \\right], \\quad y = \\begin{cases} 1 & \\text{连续句子} \\\\ 0 & \\text{随机句子} \\end{cases}",
    explanation:
      "NSP 是 BERT 的辅助训练目标：判断两个句子是否连续。虽然这对下游任务帮助有限，但启发了后续的句子级别预训练方法。",
  },
];

// ch5_lesson2 — 规模化定律
const scalingLawsDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "测试损失与模型规模",
    formula:
      "L(N) \\approx \\left(\\frac{N_c}{N}\\right)^{\\alpha_N}, \\quad \\alpha_N \\approx 0.076",
    explanation:
      "在计算预算固定时，测试损失随模型参数量 N 的增加呈幂律下降。增加参数量是提升模型性能最直接的方式。",
  },
  {
    stepNumber: 2,
    title: "Chinchilla 最优分配",
    formula:
      "N_{\\text{opt}} \\propto C^{0.5}, \\quad D_{\\text{opt}} \\propto C^{0.5}",
    explanation:
      "Chinchilla 定律指出，在给定计算预算 C 时，模型参数量 N 和训练数据量 D 应按相同比例扩展。DeepMind 据此训练了 Chinchilla (70B, 1.4T tokens)，在更小模型上超越了大模型。",
  },
  {
    stepNumber: 3,
    title: "数据规模的影响",
    formula:
      "L(D) \\approx \\left(\\frac{D_c}{D}\\right)^{\\alpha_D}, \\quad \\alpha_D \\approx 0.095",
    explanation:
      "在模型大小固定时，增加训练数据量同样遵循幂律衰减。这说明数据质量和数量同等重要。",
  },
  {
    stepNumber: 4,
    title: "最优资源分配",
    formula:
      "L(N, D) = \\frac{A}{N^{\\alpha}} + \\frac{B}{D^{\\beta}} + L_{\\infty}",
    explanation:
      "完整地，损失受模型规模和数据量两个因素制约。L_∞ 表示不可约减损失（数据本质噪声），A、B、α、β 是从实验拟合的常数。",
  },
];

// ch6_lesson1 — GPT系列
const gptSeriesDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "生成式预训练 (GPT-1)",
    formula:
      "L_{\\text{pre}} = -\\sum_{t=1}^n \\log p(x_t | x_{<t}; \\theta)",
    explanation:
      "GPT-1 在大规模无标注文本上进行自回归预训练，每个词只依赖前文。预训练完成后，通过少量调整（微调）即可适配不同任务。",
  },
  {
    stepNumber: 2,
    title: "零样本迁移 (GPT-2)",
    formula:
      "p(y | x; \\theta) = \\prod_{t=1}^{|y|} p(y_t | x, y_{<t}; \\theta)",
    explanation:
      "GPT-2 将各种 NLP 任务统一为条件生成问题：给定输入 x，直接生成输出 y。无需额外训练即可在未见任务上表现良好，展现了零样本能力。",
  },
  {
    stepNumber: 3,
    title: "上下文学习 (GPT-3)",
    formula:
      "p(y | x, \\{(q_i, a_i)\\}_{i=1}^k; \\theta)",
    explanation:
      "GPT-3 引入上下文学习：在 Prompt 中提供 k 个示例 {(q_i, a_i)}，模型无需参数更新即可学习任务模式。规模越大，上下文学习能力越强。",
  },
  {
    stepNumber: 4,
    title: "人类对齐 (InstructGPT)",
    formula:
      "R_{\\phi}(x, y) \\approx \\text{人类偏好}, \\quad \\max_{\\theta} \\mathbb{E}_{y \\sim \\pi_{\\theta}}[R_{\\phi}(x, y)] - \\beta \\cdot D_{KL}(\\pi_{\\theta} \\| \\pi_{\\text{SFT}})",
    explanation:
      "InstructGPT 使用 RLHF 训练奖励模型 R_ϕ 近似人类偏好，然后用 PPO 算法优化策略 π_θ，同时通过 KL 散度约束防止偏离初始的 SFT 模型过远。",
  },
];

// ch6_lesson2 — 开源LLM
const openSourceLLMDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "LLaMA 整体架构",
    formula:
      "\\text{LLaMA}(x) = \\text{FFN}(\\text{RMSNorm}(\\text{Attn}(\\text{RMSNorm}(x))))",
    explanation:
      "LLaMA 基于 Transformer Decoder，使用 Pre-Norm（在每个子层之前做归一化）和 RMSNorm（简化版 LayerNorm），训练更稳定。",
  },
  {
    stepNumber: 2,
    title: "RoPE 位置编码",
    formula:
      "\\text{RoPE}(x_m, x_n) = x_m^T \\cdot R_{\\Theta, m-n} \\cdot x_n, \\quad R_{\\Theta, d} = \\begin{bmatrix} \\cos d\\theta & -\\sin d\\theta \\\\ \\sin d\\theta & \\cos d\\theta \\end{bmatrix}",
    explanation:
      "旋转位置编码通过旋转矩阵将位置信息融入注意力计算。它使模型能外推到比训练时更长的序列，且具有相对位置衰减特性。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 3,
    title: "SwiGLU 激活函数",
    formula:
      "\\text{SwiGLU}(x) = (x \\cdot W_1 \\odot \\sigma(x \\cdot W_2)) \\cdot W_3",
    explanation:
      "SwiGLU 是 GLU 变体，使用 Swish (σ) 门控代替 ReLU。它在相同的计算预算下比 ReLU FFN 表现更好，已被 LLaMA、PaLM 等模型采用。",
  },
  {
    stepNumber: 4,
    title: "KV-Cache 加速推理",
    formula:
      "\\text{Cache}_t = \\{(K_1, V_1), \\dots, (K_t, V_t)\\}, \\quad \\text{Attn}_{t+1} = \\text{Softmax}\\left(\\frac{Q_{t+1} \\cdot [\\text{Cache}_t, K_{t+1}]^T}{\\sqrt{d_k}}\\right) \\cdot [\\text{Cache}_t, V_{t+1}]",
    explanation:
      "KV-Cache 存储之前所有时间步的 Key 和 Value 矩阵，避免每一步重复计算，将自回归生成复杂度从 O(n²) 降为 O(n)。",
  },
  {
    stepNumber: 5,
    title: "MoE 混合专家 (Mixtral)",
    formula:
      "y = \\sum_{i=1}^N G(x)_i \\cdot E_i(x), \\quad G(x) = \\text{Softmax}(\\text{TopK}(W_g \\cdot x))",
    explanation:
      "MoE 层包含 N 个专家子网络，门控网络 G 根据输入选择 Top-K 个专家激活。Mixtral 8x7B 每个 token 只激活 2 个专家，以更少计算量达到密集模型同等效果。",
  },
];

// ── Phase 3: 工程实践 ─────────────────────────────────────────

// ch7_lesson2 — 对齐技术
const alignmentDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "RLHF 三阶段流程",
    formula:
      "\\text{SFT} \\to \\text{RM} \\to \\text{RL}: \\quad \\pi_{\\text{SFT}} \\xrightarrow{\\text{偏好数据}} R_\\phi \\xrightarrow{\\text{PPO}} \\pi_{\\theta}",
    explanation:
      "RLHF 分为三阶段：监督微调基座模型 → 训练奖励模型拟合人类偏好 → 用强化学习使策略模型最大化奖励得分，同时保持生成质量。",
  },
  {
    stepNumber: 2,
    title: "奖励模型训练",
    formula:
      "L_R(\\phi) = -\\mathbb{E}_{(x, y_w, y_l) \\sim \\mathcal{D}} \\left[ \\log \\sigma (R_\\phi(x, y_w) - R_\\phi(x, y_l)) \\right]",
    explanation:
      "奖励模型基于人类标注的偏好对 (y_w 优于 y_l) 进行 Bradley-Terry 排名训练。其输出是对生成结果质量的标量评分。",
  },
  {
    stepNumber: 3,
    title: "PPO 优化目标",
    formula:
      "\\max_{\\theta} \\mathbb{E}_{y \\sim \\pi_{\\theta}} \\left[ R_\\phi(x, y) \\right] - \\beta \\cdot \\mathbb{E}_t \\left[ \\min\\left( r_t(\\theta), \\text{clip}(r_t(\\theta), 1 - \\epsilon, 1 + \\epsilon) \\right) \\hat{A}_t \\right]",
    explanation:
      "PPO 通过裁剪比率 r_t(θ) = π_θ / π_old 来限制策略更新步长，避免单次更新过大导致训练崩溃。-β·KL 项确保模型不偏离原始能力。",
  },
  {
    stepNumber: 4,
    title: "DPO 简化方法",
    formula:
      "L_{\\text{DPO}}(\\pi_\\theta; \\pi_{\\text{ref}}) = -\\mathbb{E}_{(x,y_w,y_l) \\sim \\mathcal{D}} \\left[ \\log \\sigma\\left( \\beta \\log \\frac{\\pi_\\theta(y_w|x)}{\\pi_{\\text{ref}}(y_w|x)} - \\beta \\log \\frac{\\pi_\\theta(y_l|x)}{\\pi_{\\text{ref}}(y_l|x)} \\right) \\right]",
    explanation:
      "DPO 直接利用偏好对优化策略，无需显式训练奖励模型。它推导出奖励函数与策略比率的闭式关系，使 RLHF 简化为分类损失。",
  },
];

// ch8_lesson1 — 模型量化
const quantizationDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "浮点到整数的映射",
    formula:
      "Q(x; s, z) = \\text{clamp}\\left( \\left\\lfloor \\frac{x}{s} \\right\\rceil + z, \\, 0, \\, 2^b - 1 \\right), \\quad \\hat{x} = s \\cdot (Q - z)",
    explanation:
      "量化将连续浮点值 x 映射到离散整数 Q。s 是缩放因子，z 是零点偏移，b 是量化比特数。反量化从整数恢复近似浮点值。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 2,
    title: "对称量化",
    formula:
      "s = \\frac{2 \\cdot \\max(|x|)}{2^b - 1}, \\quad z = 0, \\quad Q = \\text{clamp}\\left( \\left\\lfloor \\frac{x}{s} \\right\\rceil, \\, -2^{b-1}, \\, 2^{b-1} - 1 \\right)",
    explanation:
      "对称量化将零点固定为零，缩放因子由最大绝对值决定。实现简单，但如果权重分布偏向正/负一侧时精度损失较大。",
  },
  {
    stepNumber: 3,
    title: "非对称量化",
    formula:
      "s = \\frac{\\max(x) - \\min(x)}{2^b - 1}, \\quad z = \\left\\lfloor -\\frac{\\min(x)}{s} \\right\\rceil",
    explanation:
      "非对称量化利用最小最大值确定缩放范围，零点偏移到最小值位置。能更好地匹配实际数据分布，但推理时需要额外的零点偏移计算。",
  },
  {
    stepNumber: 4,
    title: "校准与精度损失",
    formula:
      "L_{\\text{quant}} = \\mathbb{E}_x \\left[ \\| W \\cdot x - \\hat{W} \\cdot x \\|^2 \\right], \\quad \\text{perplexity}_\\text{后} \\approx \\text{perplexity}_\\text{前} \\cdot (1 + \\epsilon)",
    explanation:
      "量化校准通过少量校准数据最小化权重量化前后的输出差异。精度损失通常用困惑度（perplexity）的升高来衡量，4-bit 量化通常控制在 1-5% 以内。",
  },
];

// ch8_lesson2 — 推理优化
const inferenceOptimizationDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "自回归生成过程",
    formula:
      "y_t = \\arg\\max \\, p(y_t | x, y_{<t}; \\theta), \\quad t = 1, 2, \\dots, T",
    explanation:
      "LLM 推理时逐 token 生成：每一步基于输入和已生成的 token 序列，预测下一个最可能的 token。串行生成是推理延迟的主要瓶颈。",
  },
  {
    stepNumber: 2,
    title: "KV-Cache 原理",
    formula:
      "\\text{Computation with cache}: O(d^2) \\quad \\text{vs} \\quad \\text{without cache}: O(t \\cdot d^2)",
    explanation:
      "KV-Cache 缓存之前所有时间步的 K 和 V 矩阵，使每一步的计算复杂度从 O(t·d²) 降至 O(d²)，其中 t 是当前序列长度。",
  },
  {
    stepNumber: 3,
    title: "PagedAttention",
    formula:
      "\\text{物理块大小}: B \\text{ tokens}, \\quad \\text{浪费率}: 1 - \\frac{F}{B} \\text{ (F = 最后一个块填充的 token 数)}",
    explanation:
      "PagedAttention 将 KV-Cache 分页管理，按需分配物理块，消除了传统方法中预分配最大长度导致的碎片浪费，将显存利用率提升近 4 倍。这是 vLLM 的核心创新。",
  },
  {
    stepNumber: 4,
    title: "连续批处理 (Continuous Batching)",
    formula:
      "\\text{吞吐量} = \\frac{\\sum_{i=1}^B L_i}{\\max_i L_i \\cdot B} \\times \\text{峰值吞吐量}",
    explanation:
      "连续批处理在序列粒度动态调度：序列完成后立即插入新序列，无需等待整个批次完成。相比静态批处理，利用率从等待时间比大幅提升。",
  },
];

// ch9_lesson1 — Prompt工程
const promptEngineeringDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "Zero-shot 提示",
    formula:
      "p(y | x_{\\text{指令}}; \\theta)",
    explanation:
      "Zero-shot 直接向模型提供任务指令，不提供任何示例。模型需依靠预训练阶段积累的知识来理解并执行任务。",
  },
  {
    stepNumber: 2,
    title: "Few-shot 上下文学习",
    formula:
      "p(y | x_{\\text{指令}}, \\{(x_1, y_1), \\dots, (x_k, y_k)\\}, x_{\\text{查询}}; \\theta)",
    explanation:
      "Few-shot 在 Prompt 中提供 k 个输入-输出示例。模型通过模式匹配从示例中学习任务格式和规律，无需参数更新。",
  },
  {
    stepNumber: 3,
    title: "思维链 (Chain-of-Thought)",
    formula:
      "p(y | x, \\{(x_i, z_i, y_i)\\}_{i=1}^k; \\theta), \\quad z_i = \\text{中间推理步骤}",
    explanation:
      "CoT 提示在示例中显式包含中间推理步骤 z_i，引导模型在回答前先生成逐步推理过程，大幅提升了数学、逻辑等需要多步推理的任务表现。",
  },
  {
    stepNumber: 4,
    title: "Self-Consistency",
    formula:
      "\\hat{y} = \\arg\\max_y \\sum_{i=1}^m \\mathbb{1}[f(x; \\theta, T)_i = y], \\quad T > 1",
    explanation:
      "Self-Consistency 用较高温度 (T > 1) 对同一 Prompt 采样 m 条推理路径，然后投票选出最一致的答案。它利用多样性提高最终准确性。",
  },
];

// ch9_lesson2 — RAG与Agent
const ragAgentDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "向量嵌入与查询",
    formula:
      "q = \\text{Encoder}(x_{\\text{查询}}), \\quad d_i = \\text{Encoder}(\\text{文档}_i), \\quad \\text{sim}(q, d_i) = \\frac{q \\cdot d_i}{\\|q\\| \\|d_i\\|}",
    explanation:
      "RAG 使用嵌入模型将查询和文档库中的每篇文档映射到同一向量空间，通过余弦相似度衡量语义相关性。",
  },
  {
    stepNumber: 2,
    title: "Top-k 检索",
    formula:
      "\\mathcal{R}_k(x) = \\{d_{(1)}, d_{(2)}, \\dots, d_{(k)}\\}, \\quad \\text{sim}(q, d_{(1)}) \\geq \\dots \\geq \\text{sim}(q, d_{(k)})",
    explanation:
      "根据相似度分数排序，选取前 k 篇最相关的文档作为检索结果。这些文档随后被注入到 LLM 的上下文中作为参考信息。",
  },
  {
    stepNumber: 3,
    title: "检索增强生成 (RAG)",
    formula:
      "p(y | x, \\mathcal{R}_k(x); \\theta) = \\prod_{t=1}^{|y|} p(y_t | x, \\mathcal{R}_k(x), y_{<t}; \\theta)",
    explanation:
      "RAG 将检索结果附加到 Prompt 中，让 LLM 基于外部知识生成答案。这有效缓解了知识截止和幻觉问题。",
  },
  {
    stepNumber: 4,
    title: "ReAct 推理循环",
    formula:
      "\\text{Thought: } z_t \\to \\text{Action: } a_t \\to \\text{Observation: } o_t \\to \\dots \\to \\text{Answer: } y",
    explanation:
      "ReAct Agent 交替进行推理思考 z_t 和工具调用 a_t，从环境中获取观察结果 o_t，直到得出最终答案。这种思考-行动-观察循环让 Agent 能逐步解决复杂问题。",
  },
];

/**
 * Lesson content registry — maps lesson IDs to their derivation steps and content.
 */
export const lessonContent: Partial<Record<string, LessonContent>> = {
  // ── Phase 1 ──
  ch1_lesson1: {
    derivationSteps: linearAlgebraDerivationSteps,
    bodyText:
      "线性代数是深度学习最基础的数学工具。从矩阵乘法到特征值分解，这些概念构成了理解神经网络表示能力和 Transformer 注意力机制的理论基础。",
    backLink: { chapterId: "ch1", chapterTitle: "数学基础" },
  },
  ch1_lesson2: {
    derivationSteps: calculusDerivationSteps,
    bodyText:
      "微积分中的导数和链式法则是神经网络训练的核心。梯度下降法利用链式法则从输出层向输入层逐层传播误差信号，使所有参数都能得到有效更新。",
    backLink: { chapterId: "ch1", chapterTitle: "数学基础" },
  },
  ch2_lesson1: {
    derivationSteps: nnBasicDerivationSteps,
    bodyText:
      "从感知器到多层感知器，神经网络通过堆叠线性变换和非线性激活来逼近任意复杂函数。激活函数的选择直接影响网络的训练难度和表达能力。",
    backLink: { chapterId: "ch2", chapterTitle: "深度学习基础" },
  },
  ch2_lesson2: {
    derivationSteps: backpropDerivationSteps,
    bodyText:
      "反向传播是深度学习的核心算法，通过计算损失函数对模型参数的梯度，然后使用梯度下降法更新参数，使模型逐渐收敛到最优解。",
    backLink: { chapterId: "ch2", chapterTitle: "深度学习基础" },
  },
  ch3_lesson1: {
    derivationSteps: wordEmbeddingDerivationSteps,
    bodyText:
      "词嵌入将离散的词语映射到连续的向量空间，使语义相近的词具有相似的向量表示。Word2Vec 的 Skip-gram 和负采样方法为后续的 NLP 表示学习奠定了基础。",
    backLink: { chapterId: "ch3", chapterTitle: "NLP基础" },
  },
  ch3_lesson2: {
    derivationSteps: sequenceModelDerivationSteps,
    bodyText:
      "RNN 及其变体 LSTM 曾主导序列建模。LSTM 的门控机制有效缓解了梯度消失问题，使模型能捕捉长期依赖关系。虽然已被 Transformer 取代，但其思路影响深远。",
    backLink: { chapterId: "ch3", chapterTitle: "NLP基础" },
  },
  // ── Phase 2 ──
  ch4_lesson1: {
    derivationSteps: attentionDerivationSteps,
    bodyText:
      "自注意力机制是 Transformer 架构的核心创新。它允许模型在处理每个位置时，关注输入序列中所有位置的信息，从而更好地捕捉长距离依赖关系。",
    backLink: { chapterId: "ch4", chapterTitle: "Transformer架构" },
  },
  ch4_lesson2: {
    derivationSteps: transformerArchDerivationSteps,
    bodyText:
      "Transformer 通过多头注意力、层归一化和前馈网络的组合构建了强大的 Encoder-Decoder 架构。多头注意力并行捕捉不同子空间的特征，LayerNorm 确保训练稳定，FFN 引入非线性变换。",
    backLink: { chapterId: "ch4", chapterTitle: "Transformer架构" },
  },
  ch5_lesson1: {
    derivationSteps: lmObjectivesDerivationSteps,
    bodyText:
      "语言模型的目标函数决定了模型如何从文本中学习。自回归模型从左到右逐词预测，而掩码模型利用双向上下文。这些差异导致了 GPT 和 BERT 系列不同的能力特点。",
    backLink: { chapterId: "ch5", chapterTitle: "预训练技术" },
  },
  ch5_lesson2: {
    derivationSteps: scalingLawsDerivationSteps,
    bodyText:
      "规模化定律揭示了模型性能与参数量、数据量、计算量之间的幂律关系。Chinchilla 定律告诉我们，模型和数据需要按比例同步扩大，而非盲目增加参数量。",
    backLink: { chapterId: "ch5", chapterTitle: "预训练技术" },
  },
  ch6_lesson1: {
    derivationSteps: gptSeriesDerivationSteps,
    bodyText:
      "GPT 系列从 GPT-1 的生成式预训练，到 GPT-2 的零样本能力，再到 GPT-3 的上下文学习和 InstructGPT 的人类对齐，展示了规模扩展和训练方法的持续演进。",
    backLink: { chapterId: "ch6", chapterTitle: "主流LLM架构" },
  },
  ch6_lesson2: {
    derivationSteps: openSourceLLMDerivationSteps,
    bodyText:
      "开源 LLM 社区通过 LLaMA、Mistral、Mixtral 等模型展示了高效架构设计。RoPE 位置编码、SwiGLU 激活、KV-Cache 和 MoE 路由已成为现代 LLM 的事实标准组件。",
    backLink: { chapterId: "ch6", chapterTitle: "主流LLM架构" },
  },
  // ── Phase 3 ──
  ch7_lesson1: {
    derivationSteps: loraDerivationSteps,
    bodyText:
      "LoRA (Low-Rank Adaptation) 是一种参数高效的微调方法，通过冻结原始模型权重，只训练低秩矩阵来适配特定任务，大大减少了训练成本。",
    backLink: { chapterId: "ch7", chapterTitle: "模型微调" },
  },
  ch7_lesson2: {
    derivationSteps: alignmentDerivationSteps,
    bodyText:
      "对齐技术确保 LLM 的行为符合人类期望。RLHF 通过奖励模型 + PPO 优化偏好，DPO 则进一步简化流程。两者都在提升模型有用性和安全性方面起着关键作用。",
    backLink: { chapterId: "ch7", chapterTitle: "模型微调" },
  },
  ch8_lesson1: {
    derivationSteps: quantizationDerivationSteps,
    bodyText:
      "模型量化通过降低权重和激活的数值精度来减少显存占用和加速推理。对称和非对称量化各有适用场景，校准过程在精度和压缩率之间做权衡。",
    backLink: { chapterId: "ch8", chapterTitle: "量化与部署" },
  },
  ch8_lesson2: {
    derivationSteps: inferenceOptimizationDerivationSteps,
    bodyText:
      "LLM 推理优化从 KV-Cache 加速自回归生成，到 PagedAttention 高效管理显存，再到连续批处理提升吞吐量，每一步都在将大模型部署推向更高效的方向。",
    backLink: { chapterId: "ch8", chapterTitle: "量化与部署" },
  },
  ch9_lesson1: {
    derivationSteps: promptEngineeringDerivationSteps,
    bodyText:
      "Prompt 工程是释放 LLM 能力的关键技术。从 Zero-shot 到 Few-shot，再到思维链和 Self-Consistency，这些方法让用户无需微调即可引导模型完成复杂任务。",
    backLink: { chapterId: "ch9", chapterTitle: "应用开发" },
  },
  ch9_lesson2: {
    derivationSteps: ragAgentDerivationSteps,
    bodyText:
      "RAG 通过外部知识检索扩展 LLM 的知识边界，Agent 系统通过思考-行动-观察循环实现复杂任务的自主完成。两者是 LLM 从聊天工具走向生产力工具的核心能力。",
    backLink: { chapterId: "ch9", chapterTitle: "应用开发" },
  },
};

export function getLessonContent(id: string): LessonContent | undefined {
  return lessonContent[id];
}
