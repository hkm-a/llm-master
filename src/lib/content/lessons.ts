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
    title: "输入序列表示",
    formula:
      "X = \\begin{bmatrix} x_1 \\\\ x_2 \\\\ \\vdots \\\\ x_n \\end{bmatrix} \\in \\mathbb{R}^{n \\times d}",
    explanation:
      "假设我们有一个输入序列 X，包含 n 个 token，每个 token 的维度为 d。在 Transformer 中，这些 token 已经过嵌入层和位置编码处理。",
  },
  {
    stepNumber: 2,
    title: "线性投影生成 QKV",
    formula:
      "Q = X \\cdot W_Q, \\quad K = X \\cdot W_K, \\quad V = X \\cdot W_V, \\quad W_Q, W_K, W_V \\in \\mathbb{R}^{d \\times d_k}",
    explanation:
      "通过三个独立的线性变换将输入 X 分别投影到 Query、Key、Value 空间。投影矩阵 W_Q、W_K、W_V 是模型需要学习的参数，d_k 是每个注意力头的维度。",
  },
  {
    stepNumber: 3,
    title: "缩放点积注意力分数",
    formula:
      "\\text{Score}(Q,K) = \\frac{Q \\cdot K^T}{\\sqrt{d_k}}",
    explanation:
      "计算每个 Query 与所有 Key 的点积相似度，得到 n×n 的注意力分数矩阵。除以 √d_k 进行缩放：当 d_k 较大时点积方差增大，缩放后使 softmax 梯度进入更稳定的区域。",
    animation: { type: "video", videoPath: "/videos/attention-scaled-dot-product.mp4" },
  },
  {
    stepNumber: 4,
    title: "缩放因子的数学推导",
    formula:
      "\\text{若 } q_i, k_j \\sim \\mathcal{N}(0, 1), \\text{ 则 } \\text{Var}(q_i \\cdot k_j) = d_k, \\quad \\text{Var}\\left(\\frac{q_i \\cdot k_j}{\\sqrt{d_k}}\\right) = 1",
    explanation:
      "当 q 和 k 的各分量是独立标准正态分布时，点积的方差等于 d_k。除以 √d_k 后方差归一化为 1，使 softmax 不会因输入过大而进入梯度极小的饱和区域，这是原论文的关键理论贡献。",
  },
  {
    stepNumber: 5,
    title: "Softmax 归一化",
    formula:
      "A_{ij} = \\text{Softmax}\\left(\\frac{Q \\cdot K^T}{\\sqrt{d_k}}\\right)_{ij} = \\frac{\\exp(s_{ij})}{\\sum_{k=1}^n \\exp(s_{ik})}, \\quad \\sum_{j=1}^n A_{ij} = 1",
    explanation:
      "对注意力分数矩阵的每一行应用 Softmax 函数，使其归一化为概率分布。A_{ij} 表示第 i 个 Query 对第 j 个 Key 的注意力权重，每行之和为 1。Softmax 的温度特性由缩放因子间接调节。",
  },
  {
    stepNumber: 6,
    title: "加权求和输出",
    formula:
      "\\text{Attention}(Q, K, V) = A \\cdot V, \\quad \\text{Output}_i = \\sum_{j=1}^n A_{ij} \\cdot V_j",
    explanation:
      "使用注意力权重 A 对 Value 矩阵进行加权求和。输出中每个位置 i 的向量是 Value 的凸组合，权重由该位置与所有位置的匹配程度决定，使模型能根据上下文动态聚合信息。",
  },
  {
    stepNumber: 7,
    title: "因果掩码 (Causal Masking)",
    formula:
      "M_{ij} = \\begin{cases} 0 & i \\geq j \\\\ -\\infty & i < j \\end{cases}, \\quad \\text{Attention}_{\\text{masked}} = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right) V",
    explanation:
      "在自回归解码中，将未来位置的注意力分数设为 -∞，经过 Softmax 后对应权重为零。这确保了位置 i 在生成时只能依赖自己及之前的位置，是因果语言模型的核心机制。",
  },
  {
    stepNumber: 8,
    title: "多头注意力的拆分与拼接",
    formula:
      "\\text{head}_i = \\text{Attention}(Q \\cdot W_i^Q, K \\cdot W_i^K, V \\cdot W_i^V), \\quad d_k = d / h \\\\ \\text{MultiHead}(Q,K,V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) \\cdot W_O",
    explanation:
      "多头注意力将 d 维空间分割为 h 个 d_k 维的子空间，在每个子空间上并行计算注意力。拼接后通过输出投影矩阵 W_O 聚合所有头的信息，使模型能同时关注不同位置的不同语义特征。",
    animation: { type: "attention" },
  },
  {
    stepNumber: 9,
    title: "交叉注意力 (Cross-Attention)",
    formula:
      "Q = Y \\cdot W_Q^{(c)}, \\quad K = X \\cdot W_K^{(c)}, \\quad V = X \\cdot W_V^{(c)} \\\\ \\text{CrossAttn}(Y, X) = \\text{Softmax}\\left(\\frac{(YW_Q^{(c)}) \\cdot (XW_K^{(c)})^T}{\\sqrt{d_k}}\\right) \\cdot (XW_V^{(c)})",
    explanation:
      "在 Encoder-Decoder 架构中，Decoder 的交叉注意力层 Query 来自 Decoder 输出 Y，Key 和 Value 来自 Encoder 最终输出 X。这使得 Decoder 在生成每个词时都能关注到完整的输入序列信息。",
  },
  {
    stepNumber: 10,
    title: "计算复杂度分析",
    formula:
      "\\text{Self-Attention: } O(n^2 \\cdot d), \\quad \\text{FFN: } O(n \\cdot d^2) \\\\ \\text{当 } n \\gg d \\text{ 时，注意力成为主要瓶颈}",
    explanation:
      "自注意力的复杂度是序列长度的平方 O(n²·d)，这是 Transformer 处理长序列时的根本瓶颈。相比之下，FFN 的复杂度 O(n·d²) 与序列长度 n 呈线性关系，序列变长时注意力占主导。",
  },
];

const backpropDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "计算图的节点分解",
    formula:
      "\\text{Forward: } z = W \\cdot x + b, \\quad a = \\sigma(z), \\quad L = \\text{Loss}(a, y)",
    explanation:
      "将神经网络的前向传播分解为一系列基本计算节点。每个节点接收输入、执行简单运算、产生输出。反向传播就是沿着这些节点反向计算梯度——每个节点只需知道它的局部梯度。",
  },
  {
    stepNumber: 2,
    title: "局部梯度与上游梯度",
    formula:
      "\\frac{\\partial L}{\\partial x} = \\underbrace{\\frac{\\partial L}{\\partial z}}_{\\text{上游梯度}} \\cdot \\underbrace{\\frac{\\partial z}{\\partial x}}_{\\text{局部梯度}}",
    explanation:
      "反向传播的核心思想：每个节点只需计算其输出对输入的局部梯度，然后乘以上游传来的梯度。这种局部计算模式使梯度可以通过任意复杂的图结构传播。",
    animation: { type: "video", videoPath: "/videos/gradient-backpropagation.mp4" },
  },
  {
    stepNumber: 3,
    title: "交叉熵损失函数梯度",
    formula:
      "L = -\\frac{1}{N} \\sum_{i=1}^N \\left[ y_i \\log \\hat{y}_i + (1 - y_i) \\log(1 - \\hat{y}_i) \\right], \\quad \\frac{\\partial L}{\\partial z} = \\hat{y} - y",
    explanation:
      "交叉熵损失与 Softmax 的组合有一个极简洁的梯度形式：梯度等于模型预测减去真实标签。这个优雅的性质使分类问题的反向传播实现非常简单高效。",
  },
  {
    stepNumber: 4,
    title: "线性层的梯度传播",
    formula:
      "z = W \\cdot x + b, \\quad \\frac{\\partial L}{\\partial W} = \\frac{\\partial L}{\\partial z} \\cdot x^T, \\quad \\frac{\\partial L}{\\partial x} = W^T \\cdot \\frac{\\partial L}{\\partial z}, \\quad \\frac{\\partial L}{\\partial b} = \\frac{\\partial L}{\\partial z}",
    explanation:
      "线性层有三个梯度：对权重 W 的梯度用于参数更新（上游梯度与输入的外积），对输入 x 的梯度继续向上一层传播，对偏置 b 的梯度等于上游梯度的和。",
  },
  {
    stepNumber: 5,
    title: "激活函数的梯度",
    formula:
      "a = \\text{ReLU}(z), \\quad \\frac{\\partial a}{\\partial z} = \\begin{cases} 1 & z > 0 \\\\ 0 & z \\leq 0 \\end{cases} \\\\ a = \\sigma(z), \\quad \\frac{\\partial a}{\\partial z} = a \\cdot (1 - a)",
    explanation:
      "不同激活函数的局部梯度差异巨大。ReLU 在正区间梯度恒为 1，不缩小梯度幅度。Sigmoid 在饱和区梯度趋近于 0——这就是深度网络倾向于使用 ReLU 族激活函数的原因。",
  },
  {
    stepNumber: 6,
    title: "链式法则的递归展开",
    formula:
      "\\frac{\\partial L}{\\partial W^{(l)}} = \\frac{\\partial L}{\\partial a^{(L)}} \\cdot \\left( \\prod_{k=l}^{L-1} \\frac{\\partial a^{(k+1)}}{\\partial z^{(k+1)}} \\cdot \\frac{\\partial z^{(k+1)}}{\\partial a^{(k)}} \\right) \\cdot \\frac{\\partial a^{(l)}}{\\partial z^{(l)}} \\cdot \\frac{\\partial z^{(l)}}{\\partial W^{(l)}}",
    explanation:
      "展开后可见第 l 层的梯度是输出层到 l+1 层之间所有雅可比矩阵的连乘。若雅可比矩阵范数小于 1，连乘导致梯度指数衰减（消失）；大于 1 则指数增长（爆炸）。",
  },
  {
    stepNumber: 7,
    title: "梯度消失的数值示例",
    formula:
      "\\text{10 层 Sigmoid 网络: } \\left\\| \\frac{\\partial L}{\\partial W^{(1)}} \\right\\| \\approx (0.25)^{10} \\cdot \\left\\| \\frac{\\partial L}{\\partial W^{(10)}} \\right\\| \\approx 10^{-6} \\cdot \\left\\| \\frac{\\partial L}{\\partial W^{(10)}} \\right\\|",
    explanation:
      "对于一个 10 层的 Sigmoid 网络，每层梯度收缩约 0.25 倍，传到第一层时梯度缩小到百万分之一。这意味着浅层网络权重几乎无法更新——这是深度网络长期难以训练的根本原因。",
  },
  {
    stepNumber: 8,
    title: "梯度下降参数更新",
    formula:
      "W^{(t+1)} = W^{(t)} - \\eta \\cdot \\frac{\\partial L}{\\partial W^{(t)}}, \\quad \\eta > 0",
    explanation:
      "梯度下降是最简单的优化方法：沿负梯度方向迈出步长为 η 的更新。学习率 η 是关键超参数——太大可能导致发散，太小则收敛过慢。实践中通常从 1e-3 到 1e-5 范围内调优。",
  },
  {
    stepNumber: 9,
    title: "带动量的梯度下降",
    formula:
      "v_{t+1} = \\beta \\cdot v_t + (1 - \\beta) \\cdot \\nabla L(W_t), \\quad W_{t+1} = W_t - \\eta \\cdot v_{t+1}",
    explanation:
      "动量法引入速度项 v，累积历史梯度的指数衰减移动平均。β 通常取 0.9。动量能加速收敛、越过局部极小值和平坦区域，尤其在损失函数存在狭窄峡谷时效果显著。",
  },
  {
    stepNumber: 10,
    title: "Adam 优化器",
    formula:
      "m_t = \\beta_1 m_{t-1} + (1 - \\beta_1) g_t, \\quad v_t = \\beta_2 v_{t-1} + (1 - \\beta_2) g_t^2 \\\\ \\hat{m}_t = \\frac{m_t}{1 - \\beta_1^t}, \\quad \\hat{v}_t = \\frac{v_t}{1 - \\beta_2^t}, \\quad \\theta_{t+1} = \\theta_t - \\eta \\cdot \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon}",
    explanation:
      "Adam 融合动量和自适应学习率：m 是一阶矩估计，v 是二阶矩估计。除以 √v 使每个参数有独立的自适应学习率。偏差校正项确保训练初期估计不偏小。默认 β₁=0.9, β₂=0.999, ε=1e-8。",
  },
  {
    stepNumber: 11,
    title: "梯度裁剪 (Gradient Clipping)",
    formula:
      "g \\leftarrow \\begin{cases} g \\cdot \\frac{\\text{threshold}}{\\|g\\|} & \\|g\\| > \\text{threshold} \\\\ g & \\text{otherwise} \\end{cases}",
    explanation:
      "梯度裁剪在更新前将梯度的 L2 范数限制在阈值内。这是对抗梯度爆炸的标准方法，对 RNN 训练至关重要。阈值通常在 1.0 到 10.0 之间。",
  },
  {
    stepNumber: 12,
    title: "学习率调度策略",
    formula:
      "\\eta_t = \\eta_{\\text{min}} + \\frac{1}{2}(\\eta_{\\text{max}} - \\eta_{\\text{min}})\\left(1 + \\cos\\left(\\frac{t}{T}\\pi\\right)\\right) \\quad \\text{(余弦退火)}",
    explanation:
      "学习率调度动态调整步长。余弦退火先保持高学习率快速探索后逐渐降低精细收敛。Transformer 特有的 warmup 在前几步从零线性增加到目标学习率，防止早期梯度不稳定。",
  },
];

const loraDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "全量微调的成本问题",
    formula:
      "\\text{全量微调参数量} = |W| = \\sum_{l=1}^L d_{\\text{in}}^{(l)} \\times d_{\\text{out}}^{(l)} \\\\ \\text{LLaMA-7B: } |W| \\approx 7 \\times 10^9, \\quad \\text{全精度梯度存储} \\approx 28 \\text{ GB}",
    explanation:
      "全量微调需要为每个任务保存完整模型副本并存储全部梯度。对于 7B 参数模型，仅梯度就需要约 28GB 显存。LoRA 正是为解决此问题而提出。",
  },
  {
    stepNumber: 2,
    title: "权重的低秩更新假设",
    formula:
      "W = W_0 + \\Delta W, \\quad \\text{rank}(\\Delta W) \\ll \\min(d_{\\text{in}}, d_{\\text{out}})",
    explanation:
      "LoRA 的核心假设：预训练模型权重 W₀ 在适配下游任务时，更新量 ΔW 具有低秩性质。这意味着 ΔW 可以用远小于原始维度的秩来参数化。",
  },
  {
    stepNumber: 3,
    title: "低秩分解的矩阵形式",
    formula:
      "W = W_0 + A \\cdot B, \\quad A \\in \\mathbb{R}^{m \\times r}, \\quad B \\in \\mathbb{R}^{r \\times n}, \\quad r \\ll \\min(m, n)",
    explanation:
      "将更新量 ΔW 分解为两个低秩矩阵 A 和 B 的乘积。A 从 r 维空间映射到输出空间 m，B 从输入空间 n 映射到 r 维空间。训练时 W₀ 冻结不更新，只优化 A 和 B。",
    animation: { type: "video", videoPath: "/videos/matrix-multiplication.mp4" },
  },
  {
    stepNumber: 4,
    title: "参数效率的量化对比",
    formula:
      "\\text{LoRA 参数量} = m \\times r + r \\times n = r \\cdot (m + n) \\\\ \\text{压缩比} = \\frac{r \\cdot (m + n)}{m \\times n} \\approx \\frac{r}{\\min(m, n)}",
    explanation:
      "对于 d=4096 的注意力投影层，取 r=8，LoRA 的参数量仅为全量的 8×8192/(4096²) ≈ 0.39%。用不到 1% 的参数实现有效适配，大幅降低了显存和存储需求。",
  },
  {
    stepNumber: 5,
    title: "前向传播中的 LoRA 计算",
    formula:
      "h = W_0 \\cdot x + \\Delta W \\cdot x = W_0 \\cdot x + A \\cdot (B \\cdot x)",
    explanation:
      "LoRA 前向传播先通过 B 投影到低维空间（瓶颈），再通过 A 投影回原始维度。瓶颈结构强制 ΔW 学习输入输出之间的低秩变换。计算 B→x 而非 A·B 先乘，减少计算量。",
  },
  {
    stepNumber: 6,
    title: "推理时适配器合并",
    formula:
      "W_{\\text{merged}} = W_0 + \\frac{\\alpha}{r} \\cdot A \\cdot B",
    explanation:
      "训练完成后 LoRA 适配器可合并到原始权重：W_merged = W₀ + (α/r)·A·B。合并后推理时无额外延迟。α 控制适配器影响强度，通常设为与 r 相同或更大的值。",
  },
  {
    stepNumber: 7,
    title: "QLoRA: NF4 量化格式",
    formula:
      "\\text{NF4: } q_i = Q_{\\text{NF4}}(w_i), \\quad \\text{块级 FP8 缩放因子} \\\\ \\text{双重量化: scales } \\to \\text{FP8, 每 256 个权重共享一个 FP32 scale}",
    explanation:
      "QLoRA 进一步压缩显存。NF4 是标准化 4-bit 格式，利用正态分布分配更多量化级别到信息量大的区域。双重量化将缩放因子也量化一遍，平均每权重约 3.5-bit。可在单张 24GB 卡上微调 33B 模型。",
  },
  {
    stepNumber: 8,
    title: "LoRA 秩的选择策略",
    formula:
      "r = 1, 2, 4, 8, 16, 32, 64 \\\\ r \\text{ 从 1 } \\to 8 \\text{ 时效果显著提升, 超 } 8 \\text{ 后边际收益递减}",
    explanation:
      "LoRA 原论文实验表明即使 r=1 也能学到有意义的适配方向。r 从 1 增加到 8 时性能显著提升，超过 8 后边际收益递减。推荐将 LoRA 应用于所有注意力层的 Q/K/V/O 投影矩阵。",
  },
  {
    stepNumber: 9,
    title: "AdaLoRA: 自适应秩分配",
    formula:
      "\\Delta W = P \\cdot \\Lambda \\cdot Q, \\quad \\|\\Lambda\\| \\to 0 \\text{ 通过 SVD 剪枝消除不重要维度}",
    explanation:
      "AdaLoRA 通过 SVD 参数化 ΔW = P·Λ·Q，Λ 是对角奇异值矩阵。训练中通过正则化使不重要奇异值趋向 0，训练后剪枝，实现每层的自适应秩分配。",
  },
  {
    stepNumber: 10,
    title: "多种 PEFT 方法的形式化对比",
    formula:
      "\\text{LoRA: } h = W_0 x + BAx \\\\ \\text{Adapter: } h = W_0 x + U \\cdot \\sigma(V \\cdot W_0 x) \\\\ \\text{Prefix Tuning: } [Q; P] \\cdot K = QK^T + PK^T \\text{ (P 可学习)}",
    explanation:
      "各种 PEFT 核心思路相似：冻结预训练权重，引入少量可学习参数。Adapter 在 FFN 后插入瓶颈网络，Prefix Tuning 在注意力 K/V 上添加可学习前缀。LoRA 的优势是推理时零额外延迟且参数量与模型深度无关。",
  },
];

// ── Phase 1: 基础 ─────────────────────────────────────────────

// ch1_lesson1 — 线性代数基础
const linearAlgebraDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "标量、向量、矩阵与张量",
    formula:
      "\\text{标量: } a \\in \\mathbb{R}, \\quad \\text{向量: } \\mathbf{v} \\in \\mathbb{R}^n, \\quad \\text{矩阵: } A \\in \\mathbb{R}^{m \\times n}, \\quad \\text{张量: } \\mathcal{T} \\in \\mathbb{R}^{d_1 \\times \\dots \\times d_k}",
    explanation:
      "线性代数的基本对象从低维到高维：标量是单个数值，向量是一维数组，矩阵是二维表格，张量是任意多维数组。在深度学习中，一个批次的 RGB 图像是 4 阶张量。",
  },
  {
    stepNumber: 2,
    title: "矩阵乘法定义",
    formula:
      "C_{ij} = \\sum_{k=1}^m A_{ik} \\cdot B_{kj}, \\quad A \\in \\mathbb{R}^{n \\times m}, \\, B \\in \\mathbb{R}^{m \\times p}",
    explanation:
      "矩阵乘法要求 A 的列数等于 B 的行数。结果 C 的每个元素是 A 的行与 B 的列的点积。这是神经网络全连接层前向传播的基础运算。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 3,
    title: "矩阵乘法的几何意义",
    formula:
      "\\text{线性变换: } y = A \\cdot x, \\quad A: \\mathbb{R}^n \\to \\mathbb{R}^m \\\\ \\text{组合变换: } C \\cdot x = (B \\cdot A) \\cdot x = B \\cdot (A \\cdot x)",
    explanation:
      "矩阵乘以向量是对向量施加线性变换：旋转、缩放、反射或剪切。矩阵乘法对应线性变换的组合——这正是神经网络层叠的几何本质：先施加 A 变换再施加 B 变换等价于一次性施加 BA 变换。",
  },
  {
    stepNumber: 4,
    title: "单位矩阵与逆矩阵",
    formula:
      "I \\cdot x = x, \\quad A \\cdot A^{-1} = A^{-1} \\cdot A = I",
    explanation:
      "单位矩阵 I 对角线为 1 其余为 0，相当于\"什么都不做\"的变换。逆矩阵 A⁻¹ 撤销 A 的变换。行列式为 0 的奇异矩阵对应\"压缩维度\"的不可逆变换。",
  },
  {
    stepNumber: 5,
    title: "矩阵的秩",
    formula:
      "\\text{rank}(A) = \\dim(\\text{span}\\{a_1, \\dots, a_n\\}) \\leq \\min(m, n) \\\\ \\text{rank}(XY) \\leq \\min(\\text{rank}(X), \\text{rank}(Y))",
    explanation:
      "矩阵的秩衡量其列向量张成空间的维度。满秩矩阵包含所有维度的信息，低秩矩阵信息有冗余——这是矩阵分解和 LoRA 等参数高效方法的理论基础。",
  },
  {
    stepNumber: 6,
    title: "特征值与特征向量",
    formula:
      "A \\cdot v = \\lambda \\cdot v, \\quad v \\neq 0",
    explanation:
      "如果矩阵 A 作用于向量 v 后方向不变仅缩放 λ 倍，则 λ 是特征值，v 是对应的特征向量。特征向量代表矩阵变换中的\"不变方向\"。",
  },
  {
    stepNumber: 7,
    title: "特征值分解",
    formula:
      "A = Q \\cdot \\Lambda \\cdot Q^{-1}, \\quad \\Lambda = \\text{diag}(\\lambda_1, \\dots, \\lambda_n), \\quad Q = [v_1, \\dots, v_n]",
    explanation:
      "特征值分解将矩阵 A 分解为特征向量矩阵 Q 和特征值对角矩阵 Λ。Q⁻¹ 变换到特征基，Λ 在各方向独立缩放，Q 变换回原始基。只有可对角化的方阵才能做特征值分解。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 8,
    title: "奇异值分解 (SVD)",
    formula:
      "A = U \\cdot \\Sigma \\cdot V^T, \\quad U \\in \\mathbb{R}^{m \\times m}, \\, V \\in \\mathbb{R}^{n \\times n}, \\, \\Sigma \\in \\mathbb{R}^{m \\times n}",
    explanation:
      "SVD 将任意矩阵分解为左奇异向量 U、奇异值对角矩阵 Σ 和右奇异向量 V。U 和 V 是正交矩阵（旋转），Σ 是对角矩阵（缩放）。这是最通用的矩阵分解方法。",
  },
  {
    stepNumber: 9,
    title: "SVD 的几何解释与 PCA",
    formula:
      "A \\cdot x = U \\cdot (\\Sigma \\cdot (V^T \\cdot x)) = \\text{旋转}(\\text{缩放}(\\text{旋转}(x)))",
    explanation:
      "SVD 将任意线性变换分解为旋转-缩放-旋转。在 PCA 降维中，保留最大的 k 个奇异值及其对应的奇异向量，即可实现最优的低秩近似（Eckart-Young 定理），使信息损失最小化。",
  },
  {
    stepNumber: 10,
    title: "向量空间与基变换",
    formula:
      "\\text{基变换: } [v]_{\\mathcal{B}'} = P^{-1} \\cdot [v]_{\\mathcal{B}}, \\quad P = [b'_1, \\dots, b'_n] \\text{ 是新基在旧基下的坐标}",
    explanation:
      "同一向量在不同基下有不同坐标。基变换矩阵 P 的列是新基在旧基下的坐标。理解基变换对解释特征分解（对角化即找到特征基）和 Embedding 空间分析至关重要。",
  },
];

// ch1_lesson2 — 微积分基础
const calculusDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "导数的定义与几何意义",
    formula:
      "f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}",
    explanation:
      "导数 f'(x) 是函数在 x 处的瞬时变化率，几何上对应函数曲线在该点的切线斜率。当 h 趋向 0 时割线逼近切线。在深度学习中，导数告诉我们参数朝哪个方向微调能使损失函数下降最快。",
  },
  {
    stepNumber: 2,
    title: "基本导数法则",
    formula:
      "\\frac{d}{dx}[c] = 0, \\quad \\frac{d}{dx}[x^n] = n x^{n-1}, \\quad \\frac{d}{dx}[e^x] = e^x, \\quad \\frac{d}{dx}[\\ln x] = \\frac{1}{x}",
    explanation:
      "基本函数的导数是微积分运算的基石：幂函数降幂，指数函数不变，对数函数取倒数。这些基本法则的组合能计算任意复杂函数的导数。",
  },
  {
    stepNumber: 3,
    title: "链式法则 (复合函数)",
    formula:
      "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}, \\quad y = y(u(x))",
    explanation:
      "链式法则是微积分中最重要的法则之一，它告诉我们如何计算复合函数对自变量的导数。在神经网络中，损失函数是各层参数的复合函数，链式法则使梯度能从输出层逐层传播到输入层。",
    animation: { type: "gradient" },
  },
  {
    stepNumber: 4,
    title: "链式法则的复合展开",
    formula:
      "\\frac{d}{dx} f(g(h(x))) = f'(g(h(x))) \\cdot g'(h(x)) \\cdot h'(x)",
    explanation:
      "复合函数每增加一层嵌套，链式法则就多一项乘法因子。这就是为什么深度网络训练需要链式法则——每一层都是对上一层的函数嵌套，乘积中的每一项对应一个局部梯度。",
  },
  {
    stepNumber: 5,
    title: "偏导数",
    formula:
      "\\frac{\\partial f}{\\partial x_i} = \\lim_{h \\to 0} \\frac{f(x_1, \\dots, x_i + h, \\dots, x_n) - f(x_1, \\dots, x_n)}{h}",
    explanation:
      "偏导数衡量多元函数沿某个坐标轴方向的变化率，计算时将其他变量视为常数。在神经网络中，损失函数是数亿个参数的多元函数，每个参数的偏导数指示了该参数的调整方向。",
  },
  {
    stepNumber: 6,
    title: "多元链式法则 (雅可比矩阵)",
    formula:
      "\\frac{\\partial L}{\\partial x_i} = \\sum_{j=1}^m \\frac{\\partial L}{\\partial y_j} \\cdot \\frac{\\partial y_j}{\\partial x_i}, \\quad \\text{向量形式: } \\nabla_x L = (J_y(x))^T \\cdot \\nabla_y L",
    explanation:
      "当中间变量 y 是 m 维向量时，链式法则需对所有中间分量求和。向量形式更简洁：输入梯度 = 雅可比矩阵的转置 × 输出梯度。雅可比矩阵编码了输入输出之间所有的局部变化关系。",
  },
  {
    stepNumber: 7,
    title: "梯度向量",
    formula:
      "\\nabla f = \\begin{bmatrix} \\frac{\\partial f}{\\partial x_1} & \\frac{\\partial f}{\\partial x_2} & \\cdots & \\frac{\\partial f}{\\partial x_n} \\end{bmatrix}^T",
    explanation:
      "梯度向量由所有偏导数组成，指向函数值增长最快的方向。其模长表示变化率的大小。负梯度方向是函数值下降最快的方向——这是梯度下降法的理论基础。",
  },
  {
    stepNumber: 8,
    title: "梯度下降迭代公式",
    formula:
      "\\theta^{(t+1)} = \\theta^{(t)} - \\eta \\cdot \\nabla L(\\theta^{(t)})",
    explanation:
      "梯度下降法沿负梯度方向迭代更新参数，学习率 η 控制步长。从山顶（高损失）沿最陡坡向下走，最终到达山谷（最小损失）。这是所有现代神经网络优化器的基础。",
  },
  {
    stepNumber: 9,
    title: "从梯度下降到 Adam",
    formula:
      "\\text{SGD: } \\theta_{t+1} = \\theta_t - \\eta g_t \\\\ \\text{Momentum: } v_{t+1} = \\beta v_t + g_t, \\quad \\theta_{t+1} = \\theta_t - \\eta v_{t+1} \\\\ \\text{Adam: } \\theta_{t+1} = \\theta_t - \\eta \\frac{m_t}{\\sqrt{v_t} + \\epsilon}",
    explanation:
      "梯度下降的演进方向是更智能的步长调节。SGD 简单但路径震荡大。动量引入惯性平滑优化轨迹。Adam 为每个参数独立调整学习率，是目前最广泛使用的优化器。",
  },
  {
    stepNumber: 10,
    title: "二阶导数与曲率",
    formula:
      "f''(x) = \\lim_{h \\to 0} \\frac{f'(x + h) - f'(x)}{h}, \\quad \\text{Hessian: } H_{ij} = \\frac{\\partial^2 f}{\\partial x_i \\partial x_j}",
    explanation:
      "二阶导数衡量一阶导数的变化率（曲线曲率）。Hessian 矩阵 H 编码了所有二阶偏导数，在鞍点处（梯度为 0）Hessian 特征值正负混合——这是高维损失函数中普遍存在的现象。",
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
    title: "为什么要用低维稠密向量表示词？",
    formula:
      "\\text{观点: } [1, 0, 0, \\dots], \\quad \\text{苹果: } [0, 1, 0, \\dots], \\quad \\text{香蕉: } [0, 0, 1, \\dots] \\\\ \\text{词汇量 } V = 50,000 \\to \\text{向量维度 } = 50,000",
    explanation:
      "One-Hot 编码将每个词表示为 V 维稀疏向量，维度等于词汇表大小。这不仅维度灾难，且所有向量两两正交，无法表达\"苹果\"与\"香蕉\"的语义相似性。我们需要低维稠密向量来编码语义。",
  },
  {
    stepNumber: 2,
    title: "嵌入矩阵与查表操作",
    formula:
      "E \\in \\mathbb{R}^{V \\times d}, \\quad e_i = E[i,:] = E \\cdot \\text{one-hot}(i)",
    explanation:
      "嵌入矩阵 E 的每一行对应一个词的 d 维稠密向量。实际使用时通过查表（lookup）获取词向量而非矩阵乘法——取 E 的第 i 行就是词 i 的嵌入。训练过程中，语义相近的词在嵌入空间中会靠拢。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 3,
    title: "分布式假设与 Word2Vec",
    formula:
      "\\text{分布式假设: \"由它的同伴来知晓这个词\" (Firth, 1957)}",
    explanation:
      "Word2Vec 的核心思想源自分布式假设：词的语义由其上下文决定。\"国王\"常与\"王冠\"\"王座\"\"王后\"同现，\"女王\"也共享类似上下文。通过预测词的上下文或根据上下文预测词，模型能学到蕴含语义关系的词向量。",
  },
  {
    stepNumber: 4,
    title: "Skip-Gram 模型",
    formula:
      "\\max \\sum_{t=1}^T \\sum_{-c \\leq j \\leq c, j \\neq 0} \\log P(w_{t+j} | w_t), \\quad P(w_O | w_I) = \\frac{\\exp(v_{w_O}'^T v_{w_I})}{\\sum_{w=1}^V \\exp(v_w'^T v_{w_I})}",
    explanation:
      "Skip-Gram 用中心词 w_t 预测上下文词。概率使用 Softmax 定义，v 是输入向量，v' 是输出向量。训练使目标词与上下文词的向量内积增大。窗口大小 c 通常取 5-10，更大的窗口捕捉更广的语义关系。",
  },
  {
    stepNumber: 5,
    title: "负采样 (Negative Sampling)",
    formula:
      "\\log \\sigma(v_{w_O}'^T v_{w_I}) + \\sum_{k=1}^K \\mathbb{E}_{w_k \\sim P_n(w)} \\left[ \\log \\sigma(-v_{w_k}'^T v_{w_I}) \\right]",
    explanation:
      "全词汇表 Softmax 计算成本过高（需对所有 V 个词求和）。负采样将分类问题转化为二分类：最大化正样本概率 × 最小化 K 个随机负样本概率。K 通常取 5-20，小型数据集取更大值。",
  },
  {
    stepNumber: 6,
    title: "GloVe: 全局词共现矩阵",
    formula:
      "J = \\sum_{i,j=1}^V f(X_{ij}) \\left( w_i^T \\tilde{w}_j + b_i + \\tilde{b}_j - \\log X_{ij} \\right)^2",
    explanation:
      "GloVe（Global Vectors）结合了 Word2Vec 的局部上下文方法和矩阵分解的全局统计方法。X_{ij} 是词 i 和 j 的共现计数。加权函数 f 防止高频噪音词的过度影响。训练使词向量内积逼近共现概率的对数。",
  },
  {
    stepNumber: 7,
    title: "词向量空间中的线性类比推理",
    formula:
      "\\text{国王} - \\text{王后} \\approx \\text{男人} - \\text{女人} \\\\ \\text{法国} - \\text{巴黎} \\approx \\text{日本} - \\text{东京} \\\\ v_{\\text{国王}} - v_{\\text{男人}} + v_{\\text{女人}} \\approx v_{\\text{王后}}",
    explanation:
      "词向量空间展现惊人的线性结构：语义关系通过向量加减表示。国王 - 男人 + 女人 ≈ 王后，法国 - 巴黎 + 东京 ≈ 日本。这表明嵌入空间不仅编码了语义相似性还编码了语义关系的方向一致性。",
  },
  {
    stepNumber: 8,
    title: "上下文词嵌入 (Contextual Embeddings)",
    formula:
      "e_{\\text{苹果}}^{(i)} = \\text{BERT}(\\text{\"我吃了一个苹果\"})_i \\neq \\text{BERT}(\\text{\"苹果发布了新手机\"})_i",
    explanation:
      "Word2Vec 和 GloVe 为每个词分配固定向量（静态嵌入），无法处理一词多义。BERT 等上下文嵌入根据词所在句子生成动态表示：\"吃苹果\"中的苹果 vs \"苹果发布会\"中的苹果在同一模型中得到不同的向量。这是从 ELMo 到 GPT 系列的核心进步。",
  },
  {
    stepNumber: 9,
    title: "位置编码 (Positional Encoding)",
    formula:
      "\\text{PE}_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right), \\quad \\text{PE}_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right)",
    explanation:
      "自注意力本身不具有位置感知能力——改变输入顺序注意力输出不变。位置编码通过正余弦函数为每个位置添加唯一标记。不同频率的编码使模型能区分位置、捕捉相对距离，且能外推到未见过的序列长度。",
  },
];

// ch3_lesson2 — 序列模型
const sequenceModelDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "为什么需要专门的序列模型？",
    formula:
      "\\text{MLP: } y = \\sigma(Wx + b) \\quad \\text{— 固定输入输出维度，无顺序概念} \\\\ \\text{NLP 任务: 词序列长度可变, 词序改变语义}",
    explanation:
      "标准 MLP 无法处理序列数据：输入维度固定，不能处理变长输入，也没有\"顺序\"概念。\"我打你\"和\"你打我\"在 MLP 中会得到相同结果——但语义完全相反。序列模型通过隐藏状态逐步积累序列信息来解决这个问题。",
  },
  {
    stepNumber: 2,
    title: "循环神经网络 (RNN)",
    formula:
      "h_t = \\tanh(W_{hh} \\cdot h_{t-1} + W_{xh} \\cdot x_t + b_h), \\quad y_t = W_{hy} \\cdot h_t + b_y",
    explanation:
      "RNN 是序列建模的基础方案。每个时间步 t，隐藏状态 h_t 既依赖于当前输入 x_t 也依赖于上一个隐藏状态 h_{t-1}。W_{hh} 在时间步间共享，使 RNN 能处理任意长度序列。输出 y_t 可每个时间步输出（词级别任务）或仅在最后输出（句子级别任务）。",
    animation: { type: "attention" },
  },
  {
    stepNumber: 3,
    title: "RNN 中的 BPTT (通过时间反向传播)",
    formula:
      "\\frac{\\partial L}{\\partial W_{hh}} = \\sum_{t=1}^T \\frac{\\partial L_t}{\\partial h_t} \\cdot \\prod_{k=t+1}^T \\frac{\\partial h_k}{\\partial h_{k-1}} = \\sum_{t=1}^T \\frac{\\partial L_t}{\\partial h_t} \\cdot \\prod_{k=t+1}^T W_{hh}^T \\cdot \\text{diag}(\\tanh'(h_k))",
    explanation:
      "BPTT 沿时间步展开计算图反向传播。每个时间步的梯度包含从 t 到 T 所有时间步的雅可比矩阵连乘。由于 tanh 的导数 ≤ 1，长序列下连乘导致梯度指数衰减（消失）——这就是简单 RNN 无法捕捉长距离依赖的根本原因。",
  },
  {
    stepNumber: 4,
    title: "梯度消失/爆炸的时间跨度",
    formula:
      "\\text{序列长度 } T = 100, \\quad \\|\\nabla_{W_{hh}} L\\| \\approx (\\|W_{hh}\\| \\cdot \\|\\tanh'\\|)^{100} \\cdot \\|\\nabla_{h_T} L_t\\| \\\\ \\text{若 } \\|W_{hh}\\| \\cdot \\|\\tanh'\\| < 1: \\quad \\text{梯度 } \\to 0 \\text{ 无法学习长程依赖}",
    explanation:
      "时间步间的梯度传播是 W_hh 和 tanh' 的无数次连乘。如果谱半径 < 1，梯度指数衰减到 0，模型只能学 5-10 步以内的依赖；> 1 则梯度爆炸。RNN 理论上可捕捉任意长距离依赖，但实践中梯度消失严重限制了其能力。",
  },
  {
    stepNumber: 5,
    title: "LSTM 的门控记忆机制",
    formula:
      "\\text{遗忘门: } f_t = \\sigma(W_f \\cdot [h_{t-1}, x_t] + b_f) \\\\ \\text{输入门: } i_t = \\sigma(W_i \\cdot [h_{t-1}, x_t] + b_i) \\\\ \\text{输出门: } o_t = \\sigma(W_o \\cdot [h_{t-1}, x_t] + b_o) \\\\ \\text{记忆单元: } C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t \\\\ \\text{隐藏状态: } h_t = o_t \\odot \\tanh(C_t)",
    explanation:
      "LSTM 的核心创新是记忆单元 C_t 和门控结构。遗忘门 f_t 决定舍弃多少旧记忆，输入门 i_t 决定多少新信息写入，输出门 o_t 控制输出多少记忆。C_t = f_t ⊙ C_{t-1} + ... 的结构只在遗忘门接近 0 时才重置记忆，否则梯度可无损穿越——这就是 LSTM 解决长程依赖问题的关键设计。",
    animation: { type: "attention" },
  },
  {
    stepNumber: 6,
    title: "LSTM 为何缓解梯度消失",
    formula:
      "\\frac{\\partial C_t}{\\partial C_{t-1}} = f_t + \\frac{\\partial f_t}{\\partial C_{t-1}} \\cdot C_{t-1} + \\cdots \\\\ \\text{若忽略次要项: } \\frac{\\partial C_t}{\\partial C_{t-1}} \\approx f_t \\in [0, 1]",
    explanation:
      "LSTM 的梯度路径包含 CEC（Constant Error Carousel）：C_t 对 C_{t-1} 的梯度约等于遗忘门 f_t。当遗忘门接近 1 时，梯度可无损穿越长时间步。这比简单 RNN 的连乘结构稳定得多——模型通过学习遗忘门的开关来控制梯度流动。",
  },
  {
    stepNumber: 7,
    title: "GRU：简化版本",
    formula:
      "\\text{更新门: } z_t = \\sigma(W_z \\cdot [h_{t-1}, x_t]) \\\\ \\text{重置门: } r_t = \\sigma(W_r \\cdot [h_{t-1}, x_t]) \\\\ \\text{候选状态: } \\tilde{h}_t = \\tanh(W \\cdot [r_t \\odot h_{t-1}, x_t]) \\\\ \\text{最终状态: } h_t = (1 - z_t) \\odot h_{t-1} + z_t \\odot \\tilde{h}_t",
    explanation:
      "GRU 合并遗忘门和输入门为更新门 z_t，去掉独立的记忆单元，仅使用隐藏状态 h_t。参数比 LSTM 少 1/3，计算更快，在很多任务上与 LSTM 表现相当。z_t 接近 1 完全使用新状态，接近 0 完全保留旧状态。",
  },
  {
    stepNumber: 8,
    title: "双向 RNN (Bi-RNN)",
    formula:
      "\\overrightarrow{h}_t = \\text{RNN}(x_t, \\overrightarrow{h}_{t-1}), \\quad \\overleftarrow{h}_t = \\text{RNN}(x_t, \\overleftarrow{h}_{t+1}) \\\\ h_t = [\\overrightarrow{h}_t; \\overleftarrow{h}_t]",
    explanation:
      "标准的单向 RNN 只能利用过去信息。双向 RNN 运行两个方向的 RNN——一个正向处理序列，一个反向处理——然后将两个方向的隐藏状态拼接。这样每个时间步的输出同时融合了前后上下文的信息。",
  },
  {
    stepNumber: 9,
    title: "RNN 层叠与残差连接",
    formula:
      "h_t^{(l)} = \\text{RNN}(h_t^{(l-1)}, h_{t-1}^{(l)}), \\quad h_t^{(l)} = \\text{LayerNorm}(h_t^{(l)} + \\text{Dropout}(\\text{RNN}(h_t^{(l-1)}, h_{t-1}^{(l)})))",
    explanation:
      "堆叠多层 RNN 可学习更抽象的时序特征，但层数增加使训练更困难。残差连接（跳跃连接）和层归一化是训练深层 RNN 的关键技巧——残差连接让梯度有短路路径，LN 稳定每层激活值的分布。",
  },
  {
    stepNumber: 10,
    title: "Encoder-Decoder 序列到序列",
    formula:
      "\\text{编码器: } h_t = \\text{RNN}(x_t, h_{t-1}), \\quad c = h_T \\\\ \\text{解码器: } h_t' = \\text{RNN}(y_{t-1}, h_{t-1}', c), \\quad P(y_t | y_{<t}) = \\text{Softmax}(W h_t' + b)",
    explanation:
      "Seq2Seq 模型分为编码器和解码器。编码器将输入序列编码为上下文向量 c（通常是最后隐藏状态），解码器从 c 逐时间步生成输出序列。这是机器翻译、摘要、对话生成等任务的基础架构。",
  },
];

// ── Phase 2: 核心架构 ─────────────────────────────────────────

// ch4_lesson2 — Transformer结构
const transformerArchDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "整体 Encoder-Decoder 架构",
    formula:
      "\\text{Encoder: } X \\to Z = \\text{TransformerBlock}^{L}(X), \\quad \\text{Decoder: } (Z, Y_{<t}) \\to y_t",
    explanation:
      "Transformer 采用 Encoder-Decoder 结构。Encoder 由 L 个相同的 Transformer Block 堆叠组成，将输入序列 X 编码为上下文表示序列 Z。Decoder 同样有 L 层，每层除了自注意力和 FFN 外，还有交叉注意力层从 Z 中提取与当前生成相关的信息。",
  },
  {
    stepNumber: 2,
    title: "残差连接 (Residual Connection)",
    formula:
      "x^{(l+1)} = \\text{LayerNorm}\\left(x^{(l)} + \\text{Sublayer}(x^{(l)})\\right)",
    explanation:
      "每个子层输出与输入相加（残差连接），再经过层归一化。残差连接为梯度提供了短路路径——即使深层梯度很小，也能通过加法直达底层，避免了梯度消失。这是训练数十层 Transformer 的关键设计。",
  },
  {
    stepNumber: 3,
    title: "多头注意力 (Multi-Head) 的拆分机制",
    formula:
      "\\text{MultiHead}(Q,K,V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) \\cdot W_O \\\\ \\text{head}_i = \\text{Attention}(Q \\cdot W_i^Q, K \\cdot W_i^K, V \\cdot W_i^V)",
    explanation:
      "多头注意力将 d_model 维空间拆分为 h 个 d_k 维子空间（d_k = d_model / h），在每个子空间并行计算独立的注意力。每个头可以关注不同的关系类型：语法依赖、语义相似、长程关联等。W_O 将 h×d_k 的拼接结果投影回 d_model。",
    animation: { type: "attention" },
  },
  {
    stepNumber: 4,
    title: "Pre-Norm 与 Post-Norm 对比",
    formula:
      "\\text{Post-Norm (原始): } x^{(l+1)} = \\text{LayerNorm}(x^{(l)} + \\text{Sublayer}(x^{(l)})) \\\\ \\text{Pre-Norm (现代): } x^{(l+1)} = x^{(l)} + \\text{Sublayer}(\\text{LayerNorm}(x^{(l)}))",
    explanation:
      "原始 Transformer 使用 Post-Norm（先加再归一化），但深层训练时输出幅度可能增长导致不稳定。Pre-Norm（先归一化再进子层）使每层的输入都在稳定范围内，是现代实现的主流方案（如 GPT、LLaMA、BERT 后续版本都采用）。",
  },
  {
    stepNumber: 5,
    title: "前馈网络 (FFN) 与 GELU 激活",
    formula:
      "\\text{FFN-GELU: } \\text{FFN}(x) = W_2 \\cdot \\text{GELU}(W_1 \\cdot x + b_1) + b_2 \\\\ \\text{GELU}(x) = x \\cdot \\Phi(x), \\quad \\Phi(x) = \\frac{1}{2}\\left[1 + \\text{erf}\\left(\\frac{x}{\\sqrt{2}}\\right)\\right]",
    explanation:
      "FFN 两层结构先升维 (×4) 再降维。现代 Transformer 用 GELU 替代 ReLU——GELU 是 ReLU 的平滑近似，在接近 0 的区域有非零梯度，训练更稳定且收敛稍好。Transformer 中约 2/3 的参数量在 FFN 层中。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 6,
    title: "Decoder 的交叉注意力 (Cross-Attention)",
    formula:
      "Q = Y_{<t} \\cdot W_Q^{(c)}, \\quad K = Z \\cdot W_K^{(c)}, \\quad V = Z \\cdot W_V^{(c)} \\\\ \\text{CrossAttn}(Y_{<t}, Z) = \\text{Softmax}\\left(\\frac{Q \\cdot K^T}{\\sqrt{d_k}}\\right) \\cdot V",
    explanation:
      "Decoder 每层包含一个交叉注意力层，Query 来自 Decoder 自身的解码状态 Y_{<t}，Key 和 Value 来自 Encoder 的输出 Z。这使得 Decoder 在生成每个词时，能选择性地关注输入序列的不同部分——这在机器翻译中相当于在说目标语言时参考源语言的对应位置。",
  },
  {
    stepNumber: 7,
    title: "Decoder 的自注意力因果掩码",
    formula:
      "\\text{Self-Attn: } Q = Y_{<t} W_Q, \\quad K = Y_{<t} W_K, \\quad V = Y_{<t} W_V \\text{, 且} \\forall i, j: i < j \\to A_{ij} = -\\infty",
    explanation:
      "Decoder 第一层的自注意力也作用于自身输出序列，但必须使用因果掩码确保每个位置只能看到自己及之前的位置。这与 Encoder 的自注意力（无掩码、双向）形成对比——Encoder 是双向的，Decoder 是单向的。",
  },
  {
    stepNumber: 8,
    title: "位置编码与绝对位置",
    formula:
      "X_{\\text{input}} = X_{\\text{embed}} + X_{\\text{pos}}, \\quad X_{\\text{pos}} \\in \\mathbb{R}^{T \\times d_{\\text{model}}}",
    explanation:
      "自注意力本身对位置不敏感——改变输入顺序注意力输出不变（排列不变性）。通过添加位置编码来注入位置信息。原始 Transformer 使用固定频率的正余弦函数，可外推到未见过的长度。现代模型改用 RoPE 等相对位置编码，效果更好。",
  },
  {
    stepNumber: 9,
    title: "标签平滑 (Label Smoothing)",
    formula:
      "y_{\\text{smooth}} = (1 - \\epsilon) \\cdot y_{\\text{one-hot}} + \\epsilon \\cdot \\frac{1}{V}, \\quad V = \\text{词汇表大小}",
    explanation:
      "Transformer 训练使用标签平滑：将 one-hot 标签替换为软标签，在正确类别上分配 (1-ε) 概率，其余 ε 均匀分配给其他所有类别。这防止模型过度自信，提升泛化能力——原论文中 ε=0.1 的平滑使 BLEU 提升约 0.5。",
  },
  {
    stepNumber: 10,
    title: "Transformer 的参数利用率",
    formula:
      "\\text{每层参数量} = 4 \\cdot d^2 \\cdot (\\text{Attention: 4 QKV+O}) + 2 \\cdot d \\cdot 4d \\cdot 2 = 8d^2 + 8d^2 = 16d^2 \\\\ \\text{LLaMA-7B: } L=32, d=4096, V=32000 \\to \\text{参数量} \\approx 16 \\times 4096^2 \\times 32 + 32000 \\times 4096 \\approx 7B",
    explanation:
      "Transformer 大部分参数集中在注意力投影和 FFN 的权重矩阵中。对于一个 d_model 维的 L 层模型，每层约 16d² 参数（注意力和 FFN 各约 8d²）。加上词嵌入矩阵 V×d，可快速估算模型总参数量。且各层参数不共享——每层独立学习不同层次的表示。",
  },
];

// ch5_lesson1 — 语言模型目标
const lmObjectivesDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "自回归语言建模 (Autoregressive LM)",
    formula:
      "p(x_1, x_2, \\dots, x_n) = \\prod_{t=1}^n p(x_t | x_{<t})",
    explanation:
      "自回归语言模型将序列的联合概率分解为条件概率的逐词乘积——每个词只依赖前面已经生成的词。这是最基础的生成式语言模型假设，GPT 系列、LLaMA 等都使用此范式。",
  },
  {
    stepNumber: 2,
    title: "最大似然训练目标",
    formula:
      "L(\\theta) = -\\sum_{t=1}^n \\log p(x_t | x_{<t}; \\theta), \\quad p(x_t|\\cdot) = \\text{Softmax}(W_e \\cdot h_t + b)",
    explanation:
      "训练时最大化每一步条件概率的对数似然（等价于最小化负对数似然）。每个位置的输出 h_t 经 LM Head（嵌入矩阵 W_e 转置 + Softmax）映射为词汇表上的概率分布。预测目标就是真实的下一个 token。",
  },
  {
    stepNumber: 3,
    title: "因果掩码 (Causal Mask) 的实现",
    formula:
      "M_{ij} = \\begin{cases} 0 & i \\geq j \\\\ -\\infty & i < j \\end{cases}, \\quad \\text{Attention}(Q,K,V) = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right) V",
    explanation:
      "因果掩码是上三角矩阵，在注意力分数矩阵上添加 -∞ 使 softmax 后对应位置权重为 0。训练时输入序列的所有 token 仍并行传入——掩码确保并行计算的同时遵守因果约束。",
  },
  {
    stepNumber: 4,
    title: "掩码语言模型 (Masked LM)",
    formula:
      "L_{\\text{MLM}} = -\\sum_{x \\in \\mathcal{M}} \\log p(x | \\hat{X}), \\quad \\mathcal{M} = \\text{被掩码的 token 集合}",
    explanation:
      "MLM 随机选择 15% 的 token 处理：其中 80% 替换为 [MASK]，10% 替换为随机词，10% 保持不变。这样做让模型不能单纯依赖 [MASK] 标记，而必须学会利用双向上下文。最终只计算被选中位置的损失。",
  },
  {
    stepNumber: 5,
    title: "BERT 的下一句预测 (NSP)",
    formula:
      "L_{\\text{NSP}} = -\\left[ y \\log p + (1 - y) \\log(1 - p) \\right], \\quad y \\in \\{0, 1\\}",
    explanation:
      "NSP 是二分类目标：输入 [CLS] 句子A [SEP] 句子B [SEP]，预测句子B是否是句子A的下一句。后续研究（RoBERTa）发现 NSP 对下游任务帮助有限，移除后反而更好——因为 MLM 本身已能捕捉句子间关系。",
  },
  {
    stepNumber: 6,
    title: "前缀语言建模 (Prefix LM)",
    formula:
      "p(x_1, \\dots, x_k, x_{k+1}, \\dots, x_n) = \\underbrace{\\prod_{t=1}^k p(x_t | x_{<t})}_{\\text{前缀: 自回归}} \\cdot \\underbrace{\\prod_{t=k+1}^n p(x_t | x_1, \\dots, x_t)}_{\\text{后缀: 双向}}",
    explanation:
      "Prefix LM 结合了自回归和双向的特点：前缀部分的 attention 是双向的（无掩码），后缀部分保持单向。UniLM、GLM 等模型采用此方式，Prefix 部分可包含任务指令或条件信息。",
  },
  {
    stepNumber: 7,
    title: "填空式语言模型 (Permutation LM, XLNet)",
    formula:
      "\\max_{\\theta} \\, \\mathbb{E}_{z \\sim \\mathcal{Z}_n} \\left[ \\sum_{t=1}^n \\log p(x_{z_t} | x_{z_{<t}}; \\theta) \\right]",
    explanation:
      "XLNet 提出排列语言模型：对序列的所有排列进行期望。对每个排列按自回归顺序预测，但在注意力计算上使用双流自注意力实现双向上下文。它融合了自回归生成和双向表示的优点，在多个基准上超过 BERT。",
  },
  {
    stepNumber: 8,
    title: "ELECTRA 的检测器目标",
    formula:
      "L_{\\text{ELECTRA}} = -\\sum_{t=1}^n \\left[ \\mathbb{1}(\\hat{x}_t = x_t) \\log D_t + \\mathbb{1}(\\hat{x}_t \\neq x_t) \\log(1 - D_t) \\right]",
    explanation:
      "ELECTRA 用一个小 Generator（类似 MLM）替换部分 token，然后训练 Discriminator 判断每个位置是否被替换过。这比 MLM 更高效——因为它对所有 token 计算损失而非仅被掩码的 15%，计算效率提升 30%+。",
  },
];

// ch5_lesson2 — 规模化定律
const scalingLawsDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "模型规模与损失的关系 (Kaplan 定律)",
    formula:
      "L(N) \\approx \\left(\\frac{N_c}{N}\\right)^{\\alpha_N}, \\quad \\alpha_N \\approx 0.076",
    explanation:
      "在固定计算预算下，测试损失随参数量 N 的增加呈幂律下降。α_N ≈ 0.076 意味着参数量每翻倍，损失的下降量约为 2^{-0.076} ≈ 5%。损失下降速度随规模增大而减缓，但从未中断——没有明显的收益递减拐点。",
  },
  {
    stepNumber: 2,
    title: "数据规模与损失的幂律关系",
    formula:
      "L(D) \\approx \\left(\\frac{D_c}{D}\\right)^{\\alpha_D}, \\quad \\alpha_D \\approx 0.095",
    explanation:
      "固定模型大小时，增加训练数据量同样遵循幂律衰减，衰减指数 α_D ≈ 0.095 甚至比 N 的指数更大——这意味着增加数据量在初期比增加参数量收益更高。这启示了 Chinchilla 定律的发现。",
  },
  {
    stepNumber: 3,
    title: "三参数联合拟合公式",
    formula:
      "L(N, D) = \\frac{A}{N^{\\alpha}} + \\frac{B}{D^{\\beta}} + L_{\\infty}",
    explanation:
      "完整的损失函数是两个幂律项的和加上一个不可约减项 L∞。A/N^α 项代表模型容量限制，B/D^β 项代表数据信息不足的限制，L∞ 代表数据本身的固有噪声（熵）。给定计算预算 C ≈ 6ND，可求解最优的 N 和 D 分配。",
  },
  {
    stepNumber: 4,
    title: "训练计算量与损失的关系",
    formula:
      "L(C_{\\text{min}}) \\approx \\left(\\frac{C_c}{C_{\\text{min}}}\\right)^{\\alpha_C}, \\quad \\alpha_C \\approx 0.05 \\\\ C_{\\text{min}} \\approx 6 \\cdot N \\cdot D \\quad \\text{(每次前向+反向传播的 FLOPs)}",
    explanation:
      "在最优分配下，损失随训练总 FLOPs 的最小值呈幂律下降，指数 α_C ≈ 0.05。C_min ≈ 6ND 的公式来自每次参数更新需约 6 次 FLOPs（前向 2 次 + 反向 4 次）。这意味着可从小规模实验可靠外推更大模型的表现。",
  },
  {
    stepNumber: 5,
    title: "Chinchilla 定律的核心发现",
    formula:
      "N_{\\text{opt}} \\propto C^{0.5}, \\quad D_{\\text{opt}} \\propto C^{0.5}, \\quad \\text{即 } N \\text{ 和 } D \\text{ 应按相同比例增加}",
    explanation:
      "Hoffmann et al. 重新分析了规模化数据，发现 Kaplan 定律低估了数据的重要性。Chinchilla 定律指出：当计算预算 C 增加时，N 和 D 应按 0.5:0.5 的比例同步扩大。此前几乎所有范模型（GPT-3、Gopher 等）都是参数过大而训练不足的（under-trained）。",
  },
  {
    stepNumber: 6,
    title: "Chinchilla 的对比实验",
    formula:
      "\\text{Chinchilla 70B: } N = 70B, D = 1.4T \\text{ tokens} \\\\ \\text{Gopher 280B: } N = 280B, D = 300B \\text{ tokens} \\\\ \\text{结果: Chinchilla 70B 在大部分基准上超越 Gopher 280B}",
    explanation:
      "DeppMind 按照 Chinchilla 定律训练了 70B 模型在 1.4T token 上，而 Gopher 有 280B 参数但只训练了 300B token。Chinchilla 以 1/4 的参数量超越 Gopher——证明了数据充分的重要性。",
  },
  {
    stepNumber: 7,
    title: "涌现能力与临界规模",
    formula:
      "\\text{任务性能 } P(N) = \\begin{cases} \\text{随机水平} & N < N_{\\text{crit}} \\\\ \\text{显著提升} & N \\geq N_{\\text{crit}} \\end{cases}",
    explanation:
      "某些能力（如算术推理、多语言翻译）在小模型中表现随机，只有达到一个临界规模后才突然涌现（emergent）。涌现不是由单一机制引起，而是多个子能力同时越过阈值的结果。",
  },
  {
    stepNumber: 8,
    title: "训练效率与最优 token 消耗",
    formula:
      "\\text{每个参数约需 } 20\\text{ tokens}, \\quad \\text{常见估计: } D_{\\text{opt}} \\approx 20 \\cdot N_{\\text{opt}}",
    explanation:
      "按照 Chinchilla 建议，训练 LLM 时每个参数约需要 20 个训练 token。对于 7B 模型需要约 140B token，70B 模型需要约 1.4T token。这与 GPT-3（175B, 300B tokens，仅 1.7 tokens/参数）形成鲜明对比——GPT-3 严重未充分训练。",
  },
];

// ch6_lesson1 — GPT系列
const gptSeriesDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "GPT-1: 生成式预训练 + 判别式微调",
    formula:
      "\\text{阶段 1 (预训练): } L_{\\text{pre}} = -\\sum_{t=1}^n \\log p(x_t | x_{<t}; \\theta) \\\\ \\text{阶段 2 (微调): } L_{\\text{ft}} = -\\sum_{(x,y)} \\log p(y | x; \\theta_{\\text{pre}}) + \\lambda \\cdot L_{\\text{pre}}",
    explanation:
      "GPT-1 开创了预训练-微调两阶段范式。预训练在大规模无标注语料上进行自回归建模，微调时在任务数据上优化并加入预训练损失作为辅助正则化项，防止过拟合。12 层 Transformer Decoder，参数 117M。",
  },
  {
    stepNumber: 2,
    title: "GPT-2: 零样本统一任务格式",
    formula:
      "\\text{翻译: } \\text{\"英译中: \"} \\to \\text{\"Transformer 架构...\"} \\\\ \\text{问答: } \\text{\"问题: ... 答案: \"} \\to \\text{\"...\"} \\\\ \\text{所有任务: } p(y | \\text{指令}, x; \\theta)",
    explanation:
      "GPT-2 (1.5B) 将所有 NLP 任务统一为条件生成格式，不需额外微调。在零样本设置下展现令人惊讶的翻译、摘要能力。其关键贡献是证明了大规模自回归训练产生的表示具有泛化能力。",
  },
  {
    stepNumber: 3,
    title: "GPT-3: 上下文学习 (In-Context Learning)",
    formula:
      "p(y | x_{\\text{query}}, \\{(x_1, y_1), \\dots, (x_k, y_k)\\}; \\theta_{\\text{frozen}})",
    explanation:
      "GPT-3 (175B) 引入上下文学习：在 prompt 中嵌入 k 个示例 {(x_i, y_i)}，模型从这些示例的模式中推断任务意图，整个过程中 θ 完全冻结。模型参数越多，上下文学习能力越强——这是涌现能力的典型例子。",
  },
  {
    stepNumber: 4,
    title: "规模带来的涌现能力分析",
    formula:
      "\\text{小模型 (<1B): 上下文学习≈随机} \\\\ \\text{中型模型 (1-10B): 少样本 > 零样本} \\\\ \\text{大模型 (>100B): 少样本 ≈ 全量微调}",
    explanation:
      "GPT-3 论文系统分析了模型规模与上下文学习能力的关系。只有模型足够大时，少样本学习的收益才显著超过零样本。这种随规模涌现的能力表明大模型内部形成了隐式的学习算法。",
  },
  {
    stepNumber: 5,
    title: "InstructGPT / ChatGPT: 人类对齐",
    formula:
      "\\text{阶段 1 (SFT): 收集人工撰写的高质量示例} \\\\ \\text{阶段 2 (RM): 训练奖励模型拟合偏好排名} \\\\ \\text{阶段 3 (PPO): } \\max_{\\theta} \\mathbb{E}_{y \\sim \\pi_{\\theta}}[R_\\phi(x, y)] - \\beta \\cdot D_{KL}(\\pi_{\\theta} \\| \\pi_{\\text{SFT}})",
    explanation:
      "InstructGPT 的 RLHF 三步流程：SFT 模型学习人类撰写的示例；RM 学习配对偏好排名；PPO 在不偏离 SFT 模型过远的前提下最大化奖励得分。ChatGPT 在其基础上进一步优化对话能力。",
  },
  {
    stepNumber: 6,
    title: "GPT-4: 多模态与推理",
    formula:
      "\\text{输入: } (\\text{文本}, \\text{图像}), \\quad \\text{输出: } \\text{文本} \\\\ \\text{推理: Chain-of-Thought + Self-Consistency}",
    explanation:
      "GPT-4 将视觉理解纳入，支持图文混合输入。在推理链（CoT）、自适应思考等技术的加持下，在多个专业考试中达到人类顶尖水平。其训练细节未公开，但 RLHF 对齐和安全机制是核心差异。",
  },
  {
    stepNumber: 7,
    title: "GPT-4 的系统 1 / 系统 2 默认模式",
    formula:
      "\\text{系统 1 (快速): 单次前向, 快速回答} \\\\ \\text{系统 2 (慢速): 内部 CoT, 更高质量, 更慢}",
    explanation:
      "GPT-4 引入了类似双系统思维的模式：默认的快速模式（系统 1）直接输出答案；在需要时可以通过内部思维链（系统 2）进行更深入的推理。模型可自适应选择推理路径的深度。",
  },
  {
    stepNumber: 8,
    title: "GPT 系列的 Scaling 路线图",
    formula:
      "\\text{GPT-1 (2018, 117M): 预训练+微调范式} \\\\ \\text{GPT-2 (2019, 1.5B): 零样本泛化} \\\\ \\text{GPT-3 (2020, 175B): 上下文学习涌现能力} \\\\ \\text{InstructGPT (2022, 175B): 人类偏好对齐} \\\\ \\text{GPT-4 (2023, ?T): 多模态 + 推理}",
    explanation:
      "GPT 系列的演进不是单纯的参数规模增加，而是能力层次的持续上升：从需要微调到零样本，再到上下文学习和涌现能力，最后通过对齐技术确保输出符合人类预期。每个版本都在解锁新的能力维度。",
  },
];

// ch6_lesson2 — 开源LLM
const openSourceLLMDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "LLaMA 整体架构特点",
    formula:
      "\\text{LLaMA}(x) = \\text{FFN}(\\text{RMSNorm}(\\text{Attn}(\\text{RMSNorm}(x))))",
    explanation:
      "LLaMA 采用纯 Decoder 架构，使用 Pre-Norm（子层之前做 RMSNorm），FFN 使用 SwiGLU 门控激活。Meta 开源了 7B/13B/33B/65B 四种规模，使研究界可在可控资源下进行研究和微调。",
  },
  {
    stepNumber: 2,
    title: "RMSNorm 简化归一化",
    formula:
      "\\text{RMSNorm}(x) = \\frac{x}{\\sqrt{\\frac{1}{d}\\sum_{i=1}^d x_i^2 + \\epsilon}} \\cdot \\gamma",
    explanation:
      "RMSNorm 是 LayerNorm 的简化版：只做均方根归一化去掉均值中心化步骤。计算量减少约 10-15% 且效果几乎无损。γ 是可学习的缩放参数。LLaMA、Mistral 等现代模型都已采用 RMSNorm。",
  },
  {
    stepNumber: 3,
    title: "RoPE 旋转位置编码",
    formula:
      "\\text{RoPE}(x_m, x_n) = x_m^T \\cdot R_{\\Theta, m-n} \\cdot x_n, \\quad R_{\\Theta, d} = \\begin{bmatrix} \\cos d\\theta & -\\sin d\\theta \\\\ \\sin d\\theta & \\cos d\\theta \\end{bmatrix}",
    explanation:
      "RoPE 将位置信息通过旋转矩阵注入 Query 和 Key，使注意力分数自然编码相对位置。旋转频率随维度指数衰减，保留了单词距离越近关联越强的衰减特性。RoPE 支持一定程度的外推到训练时未见过的序列长度。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 4,
    title: "SwiGLU 门控激活函数",
    formula:
      "\\text{SwiGLU}(x) = (x \\cdot W_1 \\odot \\sigma(x \\cdot W_2)) \\cdot W_3",
    explanation:
      "SwiGLU 将 Swish 门控与 GLU 架构结合：先用 Swish σ(xW₂) 对 xW₁ 做元素级门控，再通过 W₃ 投影。相比 ReLU FFN，SwiGLU 在相同计算预算下表现更好，但有三组权重而非两组。",
  },
  {
    stepNumber: 5,
    title: "Grouped Query Attention (GQA)",
    formula:
      "\\text{MHA: } h \\text{ 个 Q/K/V 头} \\\\ \\text{MQA: } h \\text{ 个 Q 头, 1 组 K/V} \\\\ \\text{GQA: } h \\text{ 个 Q 头, } g \\text{ 组 K/V, } g < h",
    explanation:
      "标准多头注意力 (MHA) 每个头有独立的 K/V 投影。GQA 让多个 Query 头共享一组 Key/Value 头，显著减少 KV-Cache 的显存占用。LLaMA-2 70B 使用 GQA 以接近 MHA 的质量获得 MQA 级别的推理效率。",
  },
  {
    stepNumber: 6,
    title: "KV-Cache 推理加速",
    formula:
      "\\text{Cache}_t = \\{(K_1, V_1), \\dots, (K_t, V_t)\\}, \\quad \\text{复杂度: O(t \\cdot d^2)} \\to \\text{O(d^2)}",
    explanation:
      "KV-Cache 是自回归推理的基本加速手段。缓存历史 K/V 避免每一步重新计算所有位置的注意力。t 是已生成的长度，d 是模型维度。随着生成序列增长，显存占用线性增长（O(t·d)），这是长文本生成的瓶颈。",
  },
  {
    stepNumber: 7,
    title: "Mistral 滑动窗口注意力 (SWA)",
    formula:
      "\\text{窗口大小 } W, \\quad \\text{注意力范围: } [i - W, i - 1] \\\\ \\text{有效上下文范围: } W \\times L \\text{ (L 为层数)}",
    explanation:
      "Mistral 使用滑动窗口注意力代替全局注意力：每个位置只关注最近的 W 个位置。通过多层堆叠，上层可间接获取跨度达 W×L 范围内的信息。这显著降低了大上下文场景下的计算和内存需求。",
  },
  {
    stepNumber: 8,
    title: "MoE 混合专家 (Mixtral 8x7B)",
    formula:
      "y = \\sum_{i=1}^N G(x)_i \\cdot E_i(x), \\quad G(x) = \\text{TopK}(\\text{Softmax}(W_g \\cdot x), k)",
    explanation:
      "MoE 层包含 N 个专家前馈网络，门控网络 G 根据每个 token 选择 Top-K 个专家激活。Mixtral 8x7B 每层有 8 个专家，每 token 激活 2 个。有效参数量约 47B，但每步计算量仅相当于约 13B 模型——用更少计算达到密集模型同等性能。",
  },
  {
    stepNumber: 9,
    title: "LLaMA 系列的演进",
    formula:
      "\\text{LLaMA-1: } V=32000, \\text{ RoPE, SwiGLU, RMSNorm} \\\\ \\text{LLaMA-2: } +\\text{GQA, 40\\% 更多数据, 上下文 4K} \\\\ \\text{LLaMA-3: } \\text{分词器 } V=128K, \\text{ 上下文 8K, 训练数据 15T+ tokens}",
    explanation:
      "LLaMA-1 奠定了开源 LLM 的基础架构。LLaMA-2 改用 GQA 提升推理效率，扩展了训练数据规模。LLaMA-3 采用更大的 128K 词汇表提升 token 效率，扩展上下文窗口到 8K，使用 15T+ token 训练。每个版本都在前一代基础上系统升级。",
  },
];

// ── Phase 3: 工程实践 ─────────────────────────────────────────

// ch7_lesson2 — 对齐技术
const alignmentDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "为什么要进行人类对齐？",
    formula:
      "\\text{预训练模型的目标: } \\max p(w_t | w_{<t}) \\\\ \\text{期望对齐的目标: 有用、诚实、无害 (Helpful, Honest, Harmless)}",
    explanation:
      "预训练 LLM 优化的是文本预测准确性，这可能导致输出含有偏见、有害内容或不符合用户意图。对齐（Alignment）的目标是让模型行为与人类价值观和期望保持一致，这是 ChatGPT 等产品级模型的关键突破。",
  },
  {
    stepNumber: 2,
    title: "SFT (Supervised Fine-Tuning)",
    formula:
      "L_{\\text{SFT}} = -\\sum_{(x, y_{\\text{human}})} \\log \\pi_\\theta(y_{\\text{human}} | x)",
    explanation:
      "SFT 是 RLHF 的第一步：在人类撰写的理想回复数据上微调预训练模型。这些数据展示了期望的行为模式（如格式、语气、帮助性）。SFT 为后续的偏好优化提供了初始策略模型 π_SFT。",
  },
  {
    stepNumber: 3,
    title: "奖励模型 (Reward Model) 训练",
    formula:
      "L_R(\\phi) = -\\mathbb{E}_{(x, y_w, y_l) \\sim \\mathcal{D}} \\left[ \\log \\sigma (R_\\phi(x, y_w) - R_\\phi(x, y_l)) \\right]",
    explanation:
      "奖励模型从人类标注的偏好对 (y_w 优于 y_l) 中学习。Bradley-Terry 模型假设比较概率 p(y_w > y_l) = σ(R(y_w) - R(y_l))。训练使偏好对的排序概率最大化。训练完成后 R_ϕ 可对新生成的结果自动评分。",
  },
  {
    stepNumber: 4,
    title: "PPO 策略优化详解",
    formula:
      "\\max_{\\theta} \\mathbb{E}_{(x, y) \\sim \\mathcal{D}_{\\text{RL}}} [R_\\phi(x, y)] - \\beta \\cdot D_{KL}(\\pi_\\theta \\| \\pi_{\\text{SFT}}) \\\\ r_t(\\theta) = \\frac{\\pi_\\theta(a_t | s_t)}{\\pi_{\\text{old}}(a_t | s_t)}, \\quad \\text{目标} = \\mathbb{E}_t[\\min(r_t \\hat{A}_t, \\text{clip}(r_t, 1-\\epsilon, 1+\\epsilon) \\hat{A}_t)]",
    explanation:
      "PPO 在 RLHF 的核心是最大化奖励同时维持生成质量。第一行是整体目标：最大化奖励 + KL 散度惩罚防止偏离 SFT 模型过远。第二行是 PPO 的裁剪机制：当新旧策略比率偏离 (1-ε, 1+ε) 范围时梯度被裁剪，防止单步更新过大。",
  },
  {
    stepNumber: 5,
    title: "DPO: 无需奖励模型的直接偏好优化",
    formula:
      "L_{\\text{DPO}}(\\pi_\\theta; \\pi_{\\text{ref}}) = -\\mathbb{E}_{(x,y_w,y_l)} \\left[ \\log \\sigma\\left( \\beta \\log \\frac{\\pi_\\theta(y_w|x)}{\\pi_{\\text{ref}}(y_w|x)} - \\beta \\log \\frac{\\pi_\\theta(y_l|x)}{\\pi_{\\text{ref}}(y_l|x)} \\right) \\right]",
    explanation:
      "DPO 的关键洞察：奖励函数 R(x,y) 可以表示为 R(x,y) = β·log(π_θ/π_ref) + 常数。因此偏好优化可以转化为最大化偏好对的策略比率差异，无需显式训练和加载奖励模型。训练更稳定简单。",
  },
  {
    stepNumber: 6,
    title: "Rejection Sampling 与 Best-of-N",
    formula:
      "\\text{Best-of-N: } y^* = \\arg\\max_{i=1}^N R_\\phi(x, y_i), \\quad y_i \\sim \\pi_\\theta(\\cdot | x)",
    explanation:
      "Rejection Sampling（或 Best-of-N）是一种简单的对齐策略：从策略中采样 N 个候选输出，用奖励模型选择最好的一个。N=64 或 128 时效果接近 PPO，计算成本在推理时而非训练时。GPT-4 的技术报告提到使用了此方法。",
  },
  {
    stepNumber: 7,
    title: "RLHF 的奖励过度优化 (Reward Hacking)",
    formula:
      "\\pi_\\theta \\to \\arg\\max_{\\pi} \\mathbb{E}[R_\\phi(x, y)] \\quad \\Rightarrow \\quad \\text{高奖励但低人类满意度}",
    explanation:
      "奖励模型只是人类偏好的近似，PPO 过度优化会导致策略找到奖励模型的漏洞（reward hacking）——生成奖励极高但人类感觉不好的内容。KL 正则化是缓解此问题的关键，通常 β 设置在 0.01-0.1 范围内。",
  },
  {
    stepNumber: 8,
    title: "KTO: 仅需二元反馈的对齐",
    formula:
      "L_{\\text{KTO}} = -\\mathbb{E}_{(x,y)} \\left[ \\lambda_y \\cdot \\sigma\\left( \\beta \\log \\frac{\\pi_\\theta(y|x)}{\\pi_{\\text{ref}}(y|x)} - z_0 \\right) \\right], \\quad z_0 = \\beta \\cdot D_{KL}(\\pi_\\theta \\| \\pi_{\\text{ref}})",
    explanation:
      "KTO（Kahneman-Tversky Optimization）不需要成对偏好数据，只需要对单个输出给出好/坏评分。基于前景理论的参考点（reference point）概念——输出超过期望则有益，否则有害。这大大降低了对齐数据的标注难度。",
  },
];

// ch8_lesson1 — 模型量化
const quantizationDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "为什么要量化？降低精度与显存",
    formula:
      "\\text{FP32: 每个权重 4 字节} \\\\ \\text{FP16/BF16: 每个权重 2 字节} \\\\ \\text{INT8: 每个权重 1 字节} \\\\ \\text{INT4: 每个权重 0.5 字节} \\\\ \\text{70B 模型: FP32 需 280GB, INT4 仅需 35GB}",
    explanation:
      "量化的直接驱动力是显存压力。将模型从 FP32 压缩到 INT4 可将内存占用减少 8 倍。在 2024 年的消费级 GPU（24GB）上，INT4 量化使 70B 模型成为可能——这极大降低了使用大模型的门槛。",
  },
  {
    stepNumber: 2,
    title: "均匀量化: 浮点到整数的映射",
    formula:
      "Q(x; s, z) = \\text{clamp}\\left( \\left\\lfloor \\frac{x}{s} \\right\\rceil + z, \\, 0, \\, 2^b - 1 \\right), \\quad \\hat{x} = s \\cdot (Q - z)",
    explanation:
      "均匀量化是基础的量化方法。s（缩放因子）和 z（零点偏移）将浮点区间映射到整数范围。⌊·⌉ 是四舍五入，clamp 限制在可表示范围内。反量化近似恢复浮点值，精度损失来自四舍五入。",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 3,
    title: "对称量化 vs 非对称量化",
    formula:
      "\\text{对称: } s = \\frac{2 \\cdot \\max(|x|)}{2^{b-1} - 1}, \\quad z = 0 \\\\ \\text{非对称: } s = \\frac{\\max(x) - \\min(x)}{2^b - 1}, \\quad z = \\left\\lfloor -\\frac{\\min(x)}{s} \\right\\rceil",
    explanation:
      "对称量化零点为 0，实现简单，适用于大致对称的权重分布。非对称量化利用最小-最大范围，能更好适配偏态分布。LLM 的激活值通常偏态严重（某些 channel 数值范围差异大），更适合非对称量化。",
  },
  {
    stepNumber: 4,
    title: "量化粒度: Per-Tensor vs Per-Channel",
    formula:
      "\\text{Per-Tensor: } 1 \\text{ 组 (s,z) 作用于整个张量} \\\\ \\text{Per-Channel: } 1 \\text{ 组 (s,z) 作用于每个输出通道} \\\\ \\text{Per-Group: } 1 \\text{ 组 (s,z) 作用于每 } g \\text{ 个权重}",
    explanation:
      "更细粒度的量化保留更多信息。Per-Tensor 最简单但精度最差，Per-Channel 是权重量化的推荐方式（每个输出通道独立的 s,z）。Per-Group 分块量化（如每 32 或 128 个权重一组）在现代方法中效果最好，但需要额外存储组级缩放因子。",
  },
  {
    stepNumber: 5,
    title: "量化校准与数据驱动优化",
    formula:
      "\\text{校准目标: } \\min_{s, z} \\| WX - \\hat{W}X \\|_F^2 \\\\ \\text{或: } \\min_{s, z} \\text{KL}(p_{\\text{float}} \\| p_{\\text{quant}}) \\\\ \\text{GPTQ: 从最优化角度迭代量化每行权重}",
    explanation:
      "校准使用少量代表性数据（通常 128-1024 个样本）来确定量化参数。最简单的方案是最小化量化前后输出的 MSE 或 KL 散度。GPTQ（GPT Post-Training Quantization）将每行权重量化视为最优截断问题，逐列量化并补偿同一行中未量化的权重，精度接近训练后量化的最优水平。",
  },
  {
    stepNumber: 6,
    title: "GPTQ: 逐行最优量化",
    formula:
      "\\text{逐列量化: } q_i = \\text{quant}(w_i), \\quad w_{j>i} \\leftarrow w_{j>i} - \\frac{w_i - q_i}{H_{ii}} \\cdot H_{:,i} \\\\ H = 2XX^T + \\lambda I \\quad \\text{(Hessian 矩阵)}",
    explanation:
      "GPTQ 的算法流程：量化权重矩阵的一列，然后用 Hessian 逆矩阵补偿同一行中尚未量化的后续列。通过将量化误差反传（类似反向传播的思想）到剩余的权重中，GPTQ 显著减少了量化积累误差。这是 LLaMA 系列在 4-bit 精度下的主流量化方法。",
  },
  {
    stepNumber: 7,
    title: "AWQ: 激活感知的权重量化",
    formula:
      "\\text{重要性权重: } s = \\frac{\\max(|x|)^\\alpha}{\\text{mean}(\\max(|x|))} \\\\ \\text{缩放: } \\hat{W} = W \\cdot \\text{diag}(s)^{-1}, \\quad \\hat{x} = \\text{diag}(s) \\cdot x",
    explanation:
      "AWQ 的核心洞察：LLM 权重中只有约 1% 的通道（salient channels）对精度至关重要。通过离线按通道的重要性（来自激活值统计）对权重做重缩放，将这些关键通道的量化误差转移到非关键通道上。AWQ 在 4-bit 下的精度接近 FP16。",
  },
  {
    stepNumber: 8,
    title: "NF4: QLoRA 的归一化 4-bit 量化",
    formula:
      "\\text{NF4 量化映射: } q_i = Q_{\\text{NF4}}(w_i) \\\\ \\text{块级 FP8 缩放因子 (每 64 个权重)} \\\\ \\text{平均每权重约 4.5-bit (含开销)}",
    explanation:
      "NF4（NormalFloat4）是针对 LLM 权重分布（近似正态分布）优化的 4-bit 格式。它在信息密度高的区域（靠近 0 值两侧）分配更多量化级别，在尾部区域分配更少。QLoRA 使用 NF4 + 双重量化（缩放因子也量化）在单张 24GB 显卡上微调 33B 模型。",
  },
  {
    stepNumber: 9,
    title: "量化推理与混合精度",
    formula:
      "\\text{权重: INT4/INT8, 激活: FP16, 计算: FP16} \\\\ \\text{推理时: } y = \\text{FP16}(\\text{INT4}(W)) \\cdot \\text{FP16}(x)",
    explanation:
      "实际推理中通常混合精度运行：权重以低精度存储（INT4/INT8），激活以 FP16 计算。每次矩阵运算前将 INT4 权重反量化为 FP16 再计算——显存带宽的节省远大于反量化开销。这使 70B 模型在消费级 GPU 上达到 10-20 tok/s 的推理速度。",
  },
];

// ch8_lesson2 — 推理优化
const inferenceOptimizationDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "LLM 推理的两个阶段",
    formula:
      "\\text{Prefill: 并行处理所有输入 token, O(n^2 \\cdot d)} \\\\ \\text{Decode: 逐 token 生成, O(t \\cdot d^2) per step, 无法并行}",
    explanation:
      "LLM 推理分为 Prefill（预填充）和 Decode（解码）两阶段。Prefill 处理输入提示的所有 token，可高度并行化（GPU 友好）。Decode 逐 token 串行生成，是推理延迟的主要瓶颈——每一步只生成一个 token 且依赖上一步输出，无法并行。",
  },
  {
    stepNumber: 2,
    title: "KV-Cache 加速 Decode 阶段",
    formula:
      "\\text{Step t（无缓存）: 计算所有 } 1..t \\text{ 位置的 Key/Value → O(t \\cdot d^2)} \\\\ \\text{Step t（有缓存）: 仅计算 } K_{t+1}, V_{t+1} \\text{ → O(d^2)}",
    explanation:
      "自回归生成中，每一步的 Query 变化但历史 Key/Value 不变。KV-Cache 保留历史 K/V，每一步只需计算新增的一个 K/V 对。第 t 步的矩阵大小仅与当前步相关而非全部历史序列，大幅降低延迟。",
  },
  {
    stepNumber: 3,
    title: "KV-Cache 的显存瓶颈",
    formula:
      "\\text{KV-Cache 大小} = 2 \\cdot n_{\\text{layers}} \\cdot d_{\\text{model}} \\cdot n_{\\text{heads}} \\cdot t \\cdot \\text{bytes} \\\\ \\text{LLaMA-13B: 每 token 约 0.8MB, 4096 token → 3.2GB}",
    explanation:
      "KV-Cache 的显存占用随序列长度线性增长。大模型多层的 KV 缓存迅速消耗显存——这是长上下文生成的主要瓶颈。GQA（Grouped Query Attention）通过减少 KV 头数可将缓存减少至原来的 1/8。",
  },
  {
    stepNumber: 4,
    title: "PagedAttention: 类虚拟内存的 KV 管理",
    formula:
      "\\text{物理块: 固定大小 } B \\text{ 个 token 的 KV 续存} \\\\ \\text{逻辑块 → 物理块: 按需分配, 无需连续物理内存} \\\\ \\text{内部碎片: } \\leq B - 1 \\text{ tokens vs 传统预分配: } L_{\\text{max}} - L_{\\text{actual}}",
    explanation:
      "PagedAttention 将 KV-Cache 组织为固定大小的块，按需分配物理内存（类似 OS 的虚拟内存分页）。传统方法预分配最大序列长度的连续空间，利用率约 20-40%。PagedAttention 可将利用率提升至 95%+，且支持内存共享（多个 beam search 的序列共享相同前缀的 KV 块）。",
  },
  {
    stepNumber: 5,
    title: "连续批处理 (Continuous Batching)",
    formula:
      "\\text{静态批处理: 等待所有序列完成, 利用率 } = \\frac{\\sum L_i}{B \\cdot \\max L_i} \\\\ \\text{连续批处理: 序列粒度调度, '厨房' 式动态加入和退出}",
    explanation:
      "传统批处理等待整个批次完成才插入新请求，不同序列长度差异导致大量 GPU 空闲等待。连续批处理在每个 Decode 步骤后检查：哪些序列已完成生成，立即插入新序列填补空闲位置。Orca 论文首次提出，vLLM/TGI 都已实现。",
  },
  {
    stepNumber: 6,
    title: "FlashAttention: IO 感知的精确注意力",
    formula:
      "\\text{标准: } S = QK^T \\in \\mathbb{R}^{n \\times n} \\, (\\text{写 HBM}) \\\\ \\text{Softmax} \\to P \\, (\\text{读 S, 写 P}) \\\\ \\text{Flash: tiling 分块, 不实例化 } n \\times n \\text{ 矩阵}",
    explanation:
      "FlashAttention 的核心洞察：标准注意力计算需要将 n×n 的注意力分数矩阵写入 HBM（高带宽显存）再读取，IO 开销极大。FlashAttention 通过分块（tiling）和在线 softmax 重塑，在不实例化完整矩阵的情况下计算注意力，HBM 读写从 O(n²) 降至 O(n)，速度提升 2-4 倍。",
  },
  {
    stepNumber: 7,
    title: "Speculative Decoding (推测解码)",
    formula:
      "\\text{草稿模型 } M_{\\text{draft}} \\text{: 一步生成 } \\gamma \\text{ 个 token} \\\\ \\text{目标模型 } M_{\\text{target}} \\text{: 验证所有 } \\gamma \\text{ 个 token 的接受概率} \\\\ \\text{接受率 } \\approx 0.7-0.9, \\quad \\text{加速比} \\approx \\frac{\\gamma}{1 + \\text{拒绝率}}",
    explanation:
      "推测解码使用小型草稿模型快速生成长度为 γ 的候选序列，然后让大模型验证——验证可一次并行完成。典型配置 γ=4，接受率约 80%，可实现 2-3x 的端到端加速。关键是草稿模型与大模型的行为模式匹配。",
  },
  {
    stepNumber: 8,
    title: "推理系统总览: vLLM/TGI/SGLang",
    formula:
      "\\text{Precision: FP16/INT8/INT4} \\to \\text{Quantized weights} \\\\ \\text{Scheduler: Continuous batching} \\to \\text{Higher throughput} \\\\ \\text{Memory: PagedAttention} \\to \\text{90\\%+ KV cache utilization} \\\\ \\text{Compute: FlashAttention} \\to \\text{2-4x faster attention}",
    explanation:
      "现代推理框架（vLLM、TGI、SGLang）集成了上述所有优化技术。vLLM 以 PagedAttention 为核心，通过连续批处理和 FlashAttention 实现接近硬件理论的峰值吞吐量。SGLang 进一步引入结构化生成语言，将多步推理的调度优化提升到新高度。",
  },
];

// ch9_lesson1 — Prompt工程
const promptEngineeringDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "Prompt 的结构与角色分配",
    formula:
      "\\text{系统提示: } \\text{\"你是一个有帮助的 AI 助手\"} \\\\ \\text{用户消息: } \\text{\"请解释 Transformer 架构\"} \\\\ \\text{助手回复: } \\text{\"Transformer 是一种...\"}",
    explanation:
      "有效的 Prompt 通常包含角色定位（系统消息）、任务描述和格式要求。明确的角色分配激活模型中在预训练中对应角色的特定行为模式。系统消息设定整体行为准则，用户消息给出具体任务。",
  },
  {
    stepNumber: 2,
    title: "Zero-shot Prompting",
    formula:
      "p(y | x_{\\text{任务描述}}, x_{\\text{输入}}; \\theta)",
    explanation:
      "Zero-shot 直接描述任务并提供输入。关键技巧：任务描述要具体明确，使用祈使句（'将以下中文翻译为英文' 优于 '帮我翻译'），给出期望的输出格式（JSON/列表/段落）。模型越大零样本能力越强。",
  },
  {
    stepNumber: 3,
    title: "Few-shot 上下文学习 (In-Context Learning)",
    formula:
      "p(y | x_{\\text{指令}}, \\{(x_1, y_1), \\dots, (x_k, y_k)\\}, x_{\\text{查询}}; \\theta)",
    explanation:
      "Few-shot 在 Prompt 中嵌入 k 个示例，让模型从示例模式中学习任务。选择和排列示例的技巧：覆盖多样化的输入模式；将最相近的示例放在最后靠近查询；k 通常取 3-8 即可，过多可能引入噪音。",
  },
  {
    stepNumber: 4,
    title: "思维链 (Chain-of-Thought, CoT)",
    formula:
      "p(y | x, \\{(x_i, z_i, y_i)\\}_{i=1}^k; \\theta), \\quad z_i = \\text{中间推理步骤}",
    explanation:
      "CoT 在每个示例中显式写出中间推理步骤 z_i（如 '第一步: ... 第二步: ...'）再给出最终答案。这引导模型进行结构化的逐步推理，而非直接猜测答案。在 GSM8K 数学推理上，CoT 将准确率从 18% 提升至 58%。",
  },
  {
    stepNumber: 5,
    title: "Zero-Shot CoT (Let's Think Step by Step)",
    formula:
      "\\text{标准: } \\text{\"Q: {问题} A: \"} \\\\ \\text{Zero-shot CoT: } \\text{\"Q: {问题} A: Let's think step by step.\"}",
    explanation:
      "Zero-shot CoT 惊人地简单有效：只需在原始 Prompt 后追加 'Let's think step by step.' 或 '我们来一步步思考：'，不需要人工编写示例推理步骤。在数学、逻辑推理任务上提升 10-30% 准确率。",
  },
  {
    stepNumber: 6,
    title: "Self-Consistency: 多路径投票",
    formula:
      "\\text{采样 m 条 CoT 路径: } \\{z^{(1)}, y^{(1)}\\}, \\dots, \\{z^{(m)}, y^{(m)}\\} \\\\ \\hat{y} = \\arg\\max_y \\sum_{i=1}^m \\mathbb{1}[y^{(i)} = y], \\quad T \\approx 0.5-0.7",
    explanation:
      "Self-Consistency 对同一问题采样多条 CoT 推理路径（温度 T 设 0.5-0.7 平衡多样性和相干性），然后少数服从多数选出最一致的答案。利用了推理的多样性优势——多条路径比单一路径更可靠。在多项推理基准上提升 5-15%。",
  },
  {
    stepNumber: 7,
    title: "Tree-of-Thoughts (ToT): 树形搜索推理",
    formula:
      "\\text{节点: 中间推理步骤, 边: 推理分支} \\\\ \\text{方法: BFS/DFS + 自我评价剪枝}",
    explanation:
      "ToT 将 CoT 的线性推理扩展为树形搜索：在每个推理步骤，模型生成多个候选分支，通过自我评价（评分或分类）判断哪些方向更有希望，剪枝低分路径。这个方法在需要探索和规划的复杂推理任务上显著优于 CoT。",
  },
  {
    stepNumber: 8,
    title: "ReAct: 推理与行动的结合",
    formula:
      "\\text{Thought: 我需要查找今天的天气} \\to \\text{Action: search(weather)} \\to \\text{Obs: 27°C} \\to \\text{Thought: 适合户外活动}",
    explanation:
      "ReAct（Reasoning + Acting）让模型在推理的同时生成工具调用，观察调用结果再继续推理。这是 Agent 系统的基础范式，将单一的思考链扩展为思考-行动-观察循环。具体实现时，用特别标记分隔各段（如 <thought>...</thought> <action>...</action> <observation>...</observation>）。",
  },
  {
    stepNumber: 9,
    title: "Prompt 优化与自动搜索",
    formula:
      "\\text{APE: } x_\\text{指令}^* = \\arg\\max_{x_{\\text{inst}}} \\mathbb{E}_{y \\sim p(\\cdot | x_{\\text{inst}}, x)} [\\text{Score}(y, y^*)] \\\\ \\text{DSPy: 将 Prompt 编译为可优化参数}",
    explanation:
      "手动调 Prompt 费时且不稳定。自动 Prompt 工程方法（APE）使用 LLM 生成候选指令并用验证集评估选择最优。DSPy 提出将整个 prompt 流程（指令 + 示例 + 格式）视为可优化的编译器参数，自动搜索最优配置。",
  },
];

// ch9_lesson2 — RAG与Agent
const ragAgentDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "RAG 的动机: 解决知识截止与幻觉",
    formula:
      "\\text{LLM 知识截止: 2023-10} \\\\ \\text{用户提问: \"2024 年诺贝尔化学奖获得者是谁？\"} \\\\ \\text{无 RAG: LLM 可能编造或说不知道} \\\\ \\text{有 RAG: 检索维基百科 → 准确回答}",
    explanation:
      "LLM 的知识存在截止日期且可能幻觉。RAG（检索增强生成）通过从外部知识库检索相关信息注入上下文来弥补。它不修改模型参数，而是动态补充事实依据——成本低、易更新、可追责。",
  },
  {
    stepNumber: 2,
    title: "嵌入模型与向量化",
    formula:
      "q = \\text{Encoder}(x_{\\text{查询}}), \\quad d_i = \\text{Encoder}(\\text{文档}_i), \\quad \\text{sim}(q, d_i) = \\frac{q \\cdot d_i}{\\|q\\| \\|d_i\\|}",
    explanation:
      "嵌入模型（如 text-embedding-ada-002、BGE、E5）将文本映射为 768-1536 维向量。在嵌入空间中，语义相似的文本向量距离更近。查询和文档通常分别编码（双编码器架构），支持离线预处理文档向量。",
  },
  {
    stepNumber: 3,
    title: "向量数据库与 ANN 搜索",
    formula:
      "\\text{近似最近邻 (ANN): } \\|d_i^{(search)} - q\\| \\approx \\min_j \\|d_j - q\\| \\\\ \\text{HNSW: 分层可导航小世界图, O(log N) 检索}",
    explanation:
      "存储百万/亿级文档向量后，线性搜索太慢。向量数据库（Milvus、Pinecone、Chroma、Qdrant）使用 ANN 索引在毫秒级完成检索。HNSW 图算法每节点有多级连接，搜索从顶层粗粒度开始逐层细化，在精度和速度间取得平衡。",
  },
  {
    stepNumber: 4,
    title: "检索策略: 分块与元数据过滤",
    formula:
      "\\text{文档分块策略} \\\\ \\text{固定大小: } 256 \\text{ tokens, 重叠 20 tokens} \\\\ \\text{语义分块: 按段落/句子边界分割} \\\\ \\text{元数据过滤: 时间 > 2023, 来源 = \"academic\"",
    explanation:
      "检索质量高度依赖分块策略。块太小上下文不完整，块太大引入噪音。语义分块（按句子或段落边界）优于固定大小分块。元数据过滤（日期、来源、类型等）可在向量搜索之前排除不相关的文档，提高命中率。",
  },
  {
    stepNumber: 5,
    title: "检索增强生成的完整流程",
    formula:
      "p(y | x, \\mathcal{R}_k(x); \\theta) = \\prod_{t=1}^{|y|} p(y_t | x, \\text{检索结果}, y_{<t}; \\theta) \\\\ \\text{Prompt 模板: } [\\text{指令}] + [\\text{检索结果}] + [\\text{用户查询}]",
    explanation:
      "RAG 的标准流程：① 对用户查询编码为向量 → ② 在向量数据库中检索 Top-k → ③ 将检索结果注入 Prompt 作为上下文 → ④ LLM 基于增强的上下文生成答案。搜索结果需要格式化为 LLM 友好的风格，标明每个片段的来源。",
  },
  {
    stepNumber: 6,
    title: "高级 RAG: 查询重写与迭代检索",
    formula:
      "\\text{查询重写: } q' = \\text{LLM}(\\text{\"重写查询以更好检索: \"} + q) \\\\ \\text{迭代检索: } r_1 \\to \\text{评估} \\to r_2 \\to \\dots \\to \\text{充足} \\to \\text{生成} \\\\ \\text{融合检索 (HyDE): 先假设答案再检索}",
    explanation:
      "基础 RAG 的检索质量有限。查询重写让 LLM 将模糊查询转化为明确的检索查询。迭代检索根据已检索的内容决定是否还需要更多信息。HyDE（假设文档嵌入）先生成一个假设答案再用其嵌入检索，桥接查询和文档之间的表达差异。",
  },
  {
    stepNumber: 7,
    title: "Agent 系统: 思考-行动-观察循环",
    formula:
      "\\text{Thought: } z_t \\to \\text{Action: } a_t \\to \\text{Observation: } o_t \\to \\text{Thought: } z_{t+1} \\to \\dots \\to \\text{Answer: } y",
    explanation:
      "Agent 的核心是循环闭环：模型先推理当前状态和下一步计划（Thought），然后执行具体操作（Action，如调用搜索、计算器、代码解释器），观察操作结果（Observation），再推理下一步。循环持续至目标达成。每一步的完整的思考-行动-观察记录是系统状态的关键信息。",
  },
  {
    stepNumber: 8,
    title: "工具调用 (Function Calling) 的协议",
    formula:
      "\\text{LLM 输出: } \\text{<functioncall> search(query=\"2024 ML papers\")} \\\\ \\text{系统调用: } \\text{result = search(\"2024 ML papers\")} \\\\ \\text{返回结果: } \\text{<functionresult> [...]}",
    explanation:
      "工具调用是 Agent 与外部世界交互的接口。LLM 输出格式化的函数调用意图（包含函数名和参数），系统执行函数并返回结果。GPT-4 等模型原生支持 Function Calling API，开源模型通过特殊格式标记实现。工具定义需包含函数名、参数描述和示例。",
  },
  {
    stepNumber: 9,
    title: "多 Agent 协作与反思",
    formula:
      "\\text{Agent 1 (研究者): 搜索和收集信息} \\to \\text{Agent 2 (分析师): 分析和总结} \\to \\text{Agent 3 (审核者): 审查质量}",
    explanation:
      "复杂任务可由多个专业 Agent 协作完成。每个 Agent 有独立的角色、工具和记忆。反思机制让 Agent 审视自己的输出并自我改进——类似人类的自我审查。AutoGPT、LangChain Agent、CrewAI 等框架提供了多 Agent 编排的基础设施。",
  },
  {
    stepNumber: 10,
    title: "记忆: 短期、长期与工作记忆",
    formula:
      "\\text{短期: 对话上下文 (token 窗口)} \\\\ \\text{长期: 向量数据库 (历史/知识检索)} \\\\ \\text{工作记忆: 当前任务的中间状态和结果}",
    explanation:
      "Agent 系统的记忆分三层。短期记忆即上下文窗口，用于当前对话的连贯性。长期记忆通过检索（如 RAG）获取历史知识和经验。工作记忆跟踪当前任务的中间状态——已完成步骤、已获得信息、下一步计划。这三层记忆协同使 Agent 能在长期任务中保持上下文和策略一致性。",
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
      "线性代数是深度学习中最重要的数学基础。从最基本的向量和矩阵运算，到特征值分解和奇异值分解，这些概念构成了理解神经网络表示能力的核心工具。在 Transformer 中，自注意力的 QKV 计算本质上是矩阵乘法，而嵌入层则是通过嵌入矩阵实现的线性变换。LoRA 等参数高效方法更是直接利用了低秩矩阵分解的原理。掌握线性代数不仅是理解模型架构的前提，也是设计新的训练方法和优化算法的数学基础。",
    backLink: { chapterId: "ch1", chapterTitle: "数学基础" },
  },
  ch1_lesson2: {
    derivationSteps: calculusDerivationSteps,
    bodyText:
      "微积分中的导数和链式法则是神经网络训练的理论基础。前向传播计算损失函数，反向传播利用链式法则从输出层向输入层逐层传播误差，计算每个参数的梯度。梯度下降法及其变体（SGD、Momentum、Adam）沿负梯度方向迭代更新参数，使模型逐渐收敛到损失最小值。理解微积分在深度学习中的应用，是掌握模型训练、优化器和损失函数设计的必要前提。",
    backLink: { chapterId: "ch1", chapterTitle: "数学基础" },
  },
  ch2_lesson1: {
    derivationSteps: nnBasicDerivationSteps,
    bodyText:
      "神经网络由感知器发展而来，通过堆叠线性变换和非线性激活层来逼近任意复杂函数——通用近似定理为此提供了理论基础。全连接层通过权重矩阵将输入变换到输出空间，激活函数引入非线性使网络能学习复杂模式。从 Sigmoid 到 ReLU 再到 GELU，激活函数的演进极大改善了深层网络的训练稳定性。权重初始化策略（Xavier、Kaiming）和正则化技术（Dropout、BatchNorm）进一步提升了网络的训练效率和泛化能力。",
    backLink: { chapterId: "ch2", chapterTitle: "深度学习基础" },
  },
  ch2_lesson2: {
    derivationSteps: backpropDerivationSteps,
    bodyText:
      "反向传播是深度学习的核心算法，它利用微积分中的链式法则高效计算损失函数对网络中每个参数的梯度。前向传播将输入逐层变换到输出并计算损失，反向传播从输出层开始逆向传播误差信号，每一层根据局部梯度计算本层参数的更新方向。梯度下降法沿负梯度方向迭代更新参数，使模型逐渐收敛到损失最小值。",
    backLink: { chapterId: "ch2", chapterTitle: "深度学习基础" },
  },
  ch3_lesson1: {
    derivationSteps: wordEmbeddingDerivationSteps,
    bodyText:
      "词嵌入是将离散的词语映射到连续向量空间的技术，是 NLP 的基石。从 One-Hot 编码到 Word2Vec 的 Skip-Gram 和 CBOW 模型，再到 GloVe 的全局矩阵分解方法，词嵌入使得语义相似的词在向量空间中距离更近。词向量空间的线性类比推理（国王 - 男人 + 女人 ≈ 王后）展示了嵌入学习捕捉到的高层语义关系。随着 Transformer 的兴起，静态词嵌入已被 BERT、GPT 等上下文嵌入取代，但嵌入矩阵作为查表操作的基本范式仍然延续至今。",
    backLink: { chapterId: "ch3", chapterTitle: "NLP基础" },
  },
  ch3_lesson2: {
    derivationSteps: sequenceModelDerivationSteps,
    bodyText:
      "序列模型是语言建模的基础。从 RNN 到 LSTM 再到 GRU，每种模型都在解决前一代的局限：RNN 的梯度消失问题，LSTM 的记忆单元和门控机制，GRU 的简化设计。BPTT 沿时间步展开的反向传播揭示了梯度问题的根源。Seq2Seq 架构结合注意力机制首次解决了变长序列的编码问题。尽管 Transformer 已取代 RNN 成为主流序列架构，但 LSTM 的门控思想和残差连接、层归一化等技巧至今仍是深度学习的基础设计模式。",
    backLink: { chapterId: "ch3", chapterTitle: "NLP基础" },
  },
  // ── Phase 2 ──
  ch4_lesson1: {
    derivationSteps: attentionDerivationSteps,
    bodyText:
      "自注意力机制是 Transformer 架构的核心创新，它彻底改变了序列建模的方式。在自注意力中，每个位置通过计算与序列中所有位置的匹配程度来聚合信息，使模型能在一层之内捕捉任意距离的依赖关系——这是 RNN 需要多个时间步才能做到的。自注意力的核心公式由 Query、Key、Value 三个角色组成：Query 代表当前位置的查询意图，Key 代表每个位置的标识，Value 代表每个位置携带的信息。通过计算 Query 与所有 Key 的匹配度（缩放点积），得到注意力权重，再用权重对 Value 加权求和。",
    backLink: { chapterId: "ch4", chapterTitle: "Transformer架构" },
  },
  ch4_lesson2: {
    derivationSteps: transformerArchDerivationSteps,
    bodyText:
      "Transformer 架构将自注意力、层归一化和前馈网络的组合进行堆叠，构建了强大的 Encoder-Decoder 结构。Encoder 通过自注意力逐层编码输入序列的上下文表示，Decoder 通过自注意力（已生成前缀）和交叉注意力（编码器输出）逐词生成输出。Pre-Norm 结构（在子层前做归一化）比 Post-Norm 训练更稳定，是目前的主流方案。FFN 层使用 ReLU（或 GELU/SwiGLU）引入非线性，中间维度通常扩大 4 倍。残差连接使梯度有短路路径直达底层，训练 100+ 层的 Transformer 成为可能。",
    backLink: { chapterId: "ch4", chapterTitle: "Transformer架构" },
  },
  ch5_lesson1: {
    derivationSteps: lmObjectivesDerivationSteps,
    bodyText:
      "语言模型的目标函数决定了模型如何从大规模文本中学习。自回归语言建模（如 GPT）将序列联合概率分解为条件概率的乘积，使用因果掩码确保每个 token 只能看到前文。这种单向建模天然适合文本生成，但无法利用下文信息。掩码语言模型（如 BERT）随机掩盖部分 token 并用双向上下文预测，学习到更丰富的表示但需要额外的 fine-tuning 适配生成任务。两者各有优劣：自回归模型生成流畅但表示偏弱，MLM 表示更强但需要 task-specific 改造。",
    backLink: { chapterId: "ch5", chapterTitle: "预训练技术" },
  },
  ch5_lesson2: {
    derivationSteps: scalingLawsDerivationSteps,
    bodyText:
      "规模化定律揭示了模型性能与三大关键因素——参数量 N、数据量 D、计算预算 C——之间的幂律关系。Kaplan 等人发现测试损失随 N 和 D 的增加呈现可预测的幂律衰减，这意味着可以从较小规模的实验可靠预测大规模模型的表现。Chinchilla 定律（Hoffmann et al., 2022）进一步纠正了此前的误区：模型和数据需要按比例同步扩大，当前许多模型实际上参数过多而训练不足。Chinchilla 70B 在 1.4T token 上训练，以更少参数量超越更大的模型。",
    backLink: { chapterId: "ch5", chapterTitle: "预训练技术" },
  },
  ch6_lesson1: {
    derivationSteps: gptSeriesDerivationSteps,
    bodyText:
      "GPT 系列代表了 LLM 发展的清晰路线图：GPT-1（2018）提出生成式预训练 + 判别式微调范式，证明了无标注数据预训练的有效性。GPT-2（2019）将各种 NLP 任务统一为条件生成，展现出零样本迁移能力。GPT-3（2020）引入上下文学习，通过 Prompt 中的示例即可学习新任务，展示了规模带来的涌现能力。InstructGPT（2022）使用 RLHF 对齐人类偏好——训练奖励模型近似人类判断，再通过 PPO 优化策略使模型输出更有用、更安全。每一步都在解锁新的能力层次。",
    backLink: { chapterId: "ch6", chapterTitle: "主流LLM架构" },
  },
  ch6_lesson2: {
    derivationSteps: openSourceLLMDerivationSteps,
    bodyText:
      "Meta 开源的 LLaMA 系列彻底改变了 LLM 生态，让研究者和开发者在可控制的资源下也能训练和微调大模型。LLaMA 使用 Pre-Norm + RMSNorm 简化归一化、RoPE 旋转位置编码支持长度外推、SwiGLU 门控激活提升效率。KV-Cache 是自回归推理的核心加速技术，将每步计算复杂度从 O(t·d²) 降至 O(d²)。MoE（混合专家）通过门控路由稀疏激活专家子网络——Mixtral 8x7B 每 token 只激活约 13B 参数，达到密集模型 30B+ 的效果。",
    backLink: { chapterId: "ch6", chapterTitle: "主流LLM架构" },
  },
  // ── Phase 3 ──
  ch7_lesson1: {
    derivationSteps: loraDerivationSteps,
    bodyText:
      "LoRA（Low-Rank Adaptation）是一种参数高效的微调方法，其核心洞察是预训练模型在下游任务上的权重更新量具有低秩特性。因此可以将更新量分解为两个低秩矩阵 A 和 B 的乘积，训练时冻结原始权重仅优化 A 和 B。对于大模型，LoRA 通常只需训练不到 1% 的参数即可达到与全量微调相当的效果。QLoRA 进一步结合 NF4 量化和双重量化技术，使 65B 模型的微调可以在单张 48GB 显卡上完成。",
    backLink: { chapterId: "ch7", chapterTitle: "模型微调" },
  },
  ch7_lesson2: {
    derivationSteps: alignmentDerivationSteps,
    bodyText:
      "对齐技术的核心目标是让 LLM 的输出符合人类的期望和价值观。RLHF（基于人类反馈的强化学习）是目前最主流的方法：先基于人类标注的偏好对（哪个回答更好）训练奖励模型来量化偏好，再用 PPO 算法使策略模型最大化奖励得分。PPO 的裁剪机制限制了策略更新的步长，避免训练崩溃。DPO（Direct Preference Optimization）则推导出奖励函数与策略比率之间的闭式关系，将 RLHF 简化为一个无需显式奖励模型的分类损失——训练更简单稳定。GPT-4、Claude 等顶级模型都依赖对齐技术来确保有用性和安全性。",
    backLink: { chapterId: "ch7", chapterTitle: "模型微调" },
  },
  ch8_lesson1: {
    derivationSteps: quantizationDerivationSteps,
    bodyText:
      "模型量化是部署大模型的关键技术，通过降低权重和激活值的数值精度来压缩模型大小和加速推理。对称量化适合权重分布大致对称的场景（如大部分层），实现简单。非对称量化利用实际数据分布的最小最大值确定零点位置，精度保留更好但推理略复杂。校准过程使用少量校准数据确定最优的量化参数——目标是最小化量化前后的输出差异。GPTQ 和 AWQ 等高级方法在 4-bit 量化下将精度损失控制在 1-5% 以内，使 70B 模型可在单张消费级显卡上运行。",
    backLink: { chapterId: "ch8", chapterTitle: "量化与部署" },
  },
  ch8_lesson2: {
    derivationSteps: inferenceOptimizationDerivationSteps,
    bodyText:
      "LLM 推理优化是使大模型在生产环境中实用化的关键。KV-Cache 是加速自回归生成的核心技术——每一步缓存之前所有时间步的 Key 和 Value 矩阵，避免重复计算。PagedAttention 将 KV-Cache 分页管理，按需分配物理块，消除了预分配导致的碎片浪费，将显存利用率提升约 4 倍（vLLM 的核心创新）。连续批处理在序列粒度动态调度，序列完成后立即插入新序列，相比等待整个批次完成的静态处理大幅提升吞吐量。Speculative Decoding 使用小模型先快速草稿再让大模型验证，在不降低生成质量的前提下实现 2-3 倍加速。",
    backLink: { chapterId: "ch8", chapterTitle: "量化与部署" },
  },
  ch9_lesson1: {
    derivationSteps: promptEngineeringDerivationSteps,
    bodyText:
      "Prompt 工程是引导 LLM 行为的核心技术，无需修改模型参数即可显著提升任务表现。Zero-shot 直接提供任务指令依赖模型预训练知识。Few-shot 在 Prompt 中提供 k 个输入-输出示例，模型通过模式匹配学习任务格式和规律。思维链（CoT）在示例中显式包含中间推理步骤，引导模型在回答前逐步推理，在数学和逻辑推理任务上效果突出。Self-Consistency 对同一 Prompt 用较高温度采样多条推理路径后投票选出最一致的答案，利用多样性提升准确性。这些方法构成了与 LLM 交互的基础工具箱。",
    backLink: { chapterId: "ch9", chapterTitle: "应用开发" },
  },
  ch9_lesson2: {
    derivationSteps: ragAgentDerivationSteps,
    bodyText:
      "RAG（检索增强生成）和 Agent 系统是让 LLM 突破自身局限、与外部世界交互的关键技术。RAG 将查询嵌入到向量空间中检索最相关的文档片段，注入 LLM 上下文作为事实依据——有效缓解了知识截止和幻觉问题。向量数据库使用近似最近邻（ANN）搜索在毫秒级内完成大规模检索。ReAct Agent 交替进行推理思考（Thought）、工具调用（Action）和观察反馈（Observation），形成一个闭环的思考-行动-观察循环。Agent 系统让 LLM 不再只是聊天机器人，而是能够独立完成复杂多步任务的自主系统——调用 API、执行代码、操控浏览器等。",
    backLink: { chapterId: "ch9", chapterTitle: "应用开发" },
  },
};

export function getLessonContent(id: string): LessonContent | undefined {
  return lessonContent[id];
}
