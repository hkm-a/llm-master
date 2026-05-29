import type { DerivationStep } from "@/types";
import type { Concept, Quiz } from "./types";

export interface LessonContent {
  derivationSteps: DerivationStep[];
  bodyText: string;
  /** 子概念列表：每个概念独立一页（可选，没有则显示旧版） */
  concepts?: Concept[];
  /** 交互式测验（可选） */
  quizzes?: Quiz[];
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
      '假设我们有一个输入序列 X，包含 n 个 token，每个 token 的维度为 d。在 Transformer 中，这些 token 已经过嵌入层和位置编码处理。\n\n【批判性思考】\n为什么用 d 维向量而不是 One-Hot 编码？\n因为 One-Hot 编码有三个致命问题：\n1. 维度灾难：词汇表有 50,000 个词，向量就是 50,000 维\n2. 稀疏性：向量中 99.99% 是 0，计算浪费\n3. 无法表达语义："猫"和"狗"的点积为 0\n\n嵌入层把 One-Hot 编码映射到低维稠密向量（如 768 维），让语义相近的词在向量空间中距离相近。',
  },
  {
    stepNumber: 2,
    title: "线性投影生成 QKV",
    formula:
      "Q = X \\cdot W_Q, \\quad K = X \\cdot W_K, \\quad V = X \\cdot W_V, \\quad W_Q, W_K, W_V \\in \\mathbb{R}^{d \\times d_k}",
    explanation:
      "通过三个独立的线性变换将输入 X 分别投影到 Query、Key、Value 空间。投影矩阵 W_Q、W_K、W_V 是模型需要学习的参数，d_k 是每个注意力头的维度。\n\n【批判性思考】\n为什么需要三个不同的投影矩阵？\n因为 Query、Key、Value 承担不同的角色：\n• Query：「我在找什么？」——当前 token 的需求\n• Key：「我能提供什么？」——其他 token 的标签\n• Value：「我的实际内容」——其他 token 的信息\n\n如果用同一个矩阵，Q=K=V，注意力就变成了简单的自相关，无法学到复杂的依赖关系。\n\n三个矩阵让模型能学到：「我需要什么」和「你能提供什么」是两个不同的概念。",
  },
  {
    stepNumber: 3,
    title: "缩放点积注意力分数",
    formula: "\\text{Score}(Q,K) = \\frac{Q \\cdot K^T}{\\sqrt{d_k}}",
    explanation:
      "计算每个 Query 与所有 Key 的点积相似度，得到 n×n 的注意力分数矩阵。除以 √d_k 进行缩放：当 d_k 较大时点积方差增大，缩放后使 softmax 梯度进入更稳定的区域。\n\n【批判性思考】\n为什么要除以 √d_k？\n假设 q 和 k 的各分量是独立标准正态分布：\n• q·k = Σ q_i × k_i\n• 每个 q_i × k_i 的方差是 1\n• n 个这样的项相加，方差是 n\n\n如果不缩放：点积的方差是 d_k，当 d_k=64 时，点积可能在 -16 到 +16 之间波动。\n\nSoftmax 对大数非常敏感：\n• 输入 [10, 1, 1] → 输出 [0.999, 0.0005, 0.0005]\n• 几乎所有权重都集中在最大值上\n\n除以 √d_k 后，点积的方差归一化为 1，Softmax 的梯度更稳定。",
    animation: { type: "video", videoPath: "/videos/attention-scaled-dot-product.mp4" },
  },
  {
    stepNumber: 4,
    title: "缩放因子的数学推导",
    formula:
      "\\text{若 } q_i, k_j \\sim \\mathcal{N}(0, 1), \\text{ 则 } \\text{Var}(q_i \\cdot k_j) = d_k, \\quad \\text{Var}\\left(\\frac{q_i \\cdot k_j}{\\sqrt{d_k}}\\right) = 1",
    explanation:
      "当 q 和 k 的各分量是独立标准正态分布时，点积的方差等于 d_k。除以 √d_k 后方差归一化为 1，使 softmax 不会因输入过大而进入梯度极小的饱和区域，这是原论文的关键理论贡献。\n\n【批判性思考】\n这个推导有一个隐含假设：q 和 k 的各分量是独立标准正态分布。\n\n但在实际训练中：\n• 初始化时：可能接近这个假设\n• 训练后：分布会偏移，可能不再是标准正态\n\n所以缩放因子 √d_k 只是一个启发式规则，不是严格的数学最优解。\n\n但实践证明这个启发式规则效果很好，所以被广泛使用。",
  },
  {
    stepNumber: 5,
    title: "Softmax 归一化",
    formula:
      "A_{ij} = \\text{Softmax}\\left(\\frac{Q \\cdot K^T}{\\sqrt{d_k}}\\right)_{ij} = \\frac{\\exp(s_{ij})}{\\sum_{k=1}^n \\exp(s_{ik})}, \\quad \\sum_{j=1}^n A_{ij} = 1",
    explanation:
      "对注意力分数矩阵的每一行应用 Softmax 函数，使其归一化为概率分布。A_{ij} 表示第 i 个 Query 对第 j 个 Key 的注意力权重，每行之和为 1。Softmax 的温度特性由缩放因子间接调节。\n\n【批判性思考】\nSoftmax 有什么问题？\n1. 计算量大：需要计算 n 个指数和 1 个求和\n2. 数值不稳定：指数可能溢出\n3. 稀疏性差：很难产生真正的稀疏注意力\n\n替代方案：\n• Top-K 只保留最大的 K 个注意力权重\n• 稀疏注意力：只计算部分位置对\n• 线性注意力：用核函数近似 Softmax\n\n这些方法可以减少计算量，但可能损失一些表达能力。",
  },
  {
    stepNumber: 6,
    title: "加权求和输出",
    formula:
      "\\text{Attention}(Q, K, V) = A \\cdot V, \\quad \\text{Output}_i = \\sum_{j=1}^n A_{ij} \\cdot V_j",
    explanation:
      "使用注意力权重 A 对 Value 矩阵进行加权求和。输出中每个位置 i 的向量是 Value 的凸组合，权重由该位置与所有位置的匹配程度决定，使模型能根据上下文动态聚合信息。\n\n【批判性思考】\n为什么用 Value 而不是直接用 Key？\n因为 Key 和 Value 承担不同的角色：\n• Key：用于计算注意力权重（「匹配度」）\n• Value：用于聚合信息（「实际内容」）\n\n如果用 Key 代替 Value：\n• 注意力权重和聚合内容耦合\n• 无法学到「匹配度高但内容不同」的模式\n\n分离 Key 和 Value 让模型更灵活：可以学到「这个词和那个词很相关，但信息内容不同」。",
  },
  {
    stepNumber: 7,
    title: "因果掩码 (Causal Masking)",
    formula:
      "M_{ij} = \\begin{cases} 0 & i \\geq j \\\\ -\\infty & i < j \\end{cases}, \\quad \\text{Attention}_{\\text{masked}} = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right) V",
    explanation:
      '在自回归解码中，将未来位置的注意力分数设为 -∞，经过 Softmax 后对应权重为零。这确保了位置 i 在生成时只能依赖自己及之前的位置，是因果语言模型的核心机制。\n\n【批判性思考】\n因果掩码的本质是什么？\n它强制模型只能「向左看」，不能「向右看」。\n\n这就像：\n• 你在写文章，只能看到已经写好的部分\n• 不能偷看未来的词\n\n但这也带来了问题：\n• 无法双向理解："我打你"和"你打我"在因果模型中是不同的\n• 无法利用未来信息：翻译时，目标语言的词可能依赖源语言后面的内容\n\n这就是为什么：\n• GPT 用因果掩码（生成任务）\n• BERT 不用因果掩码（理解任务）\n• 编码器-解码器架构：编码器双向，解码器因果',
  },
  {
    stepNumber: 8,
    title: "多头注意力的拆分与拼接",
    formula:
      "\\text{head}_i = \\text{Attention}(Q \\cdot W_i^Q, K \\cdot W_i^K, V \\cdot W_i^V), \\quad d_k = d / h \\\\ \\text{MultiHead}(Q,K,V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) \\cdot W_O",
    explanation:
      "多头注意力将 d 维空间分割为 h 个 d_k 维的子空间，在每个子空间上并行计算注意力。拼接后通过输出投影矩阵 W_O 聚合所有头的信息，使模型能同时关注不同位置的不同语义特征。\n\n【批判性思考】\n为什么要用多头而不是单头？\n因为单头注意力只能学到一种注意力模式。\n\n多头注意力让模型同时学到：\n• 语法关系：主语-谓语-宾语\n• 语义关系：修饰-被修饰\n• 位置关系：相邻-远离\n\n每个头可以专注于不同类型的依赖关系。\n\n但也有问题：\n• 每个头的维度是 d/h，可能太小\n• 头之间可能学到重复的模式\n• 计算量是单头的 h 倍（但实际上可以并行）\n\n实际中 h 通常取 8、12、16，d_k=64。",
    animation: { type: "attention" },
  },
  {
    stepNumber: 9,
    title: "交叉注意力 (Cross-Attention)",
    formula:
      "Q = Y \\cdot W_Q^{(c)}, \\quad K = X \\cdot W_K^{(c)}, \\quad V = X \\cdot W_V^{(c)} \\\\ \\text{CrossAttn}(Y, X) = \\text{Softmax}\\left(\\frac{(YW_Q^{(c)}) \\cdot (XW_K^{(c)})^T}{\\sqrt{d_k}}\\right) \\cdot (XW_V^{(c)})",
    explanation:
      "在 Encoder-Decoder 架构中，Decoder 的交叉注意力层 Query 来自 Decoder 输出 Y，Key 和 Value 来自 Encoder 最终输出 X。这使得 Decoder 在生成每个词时都能关注到完整的输入序列信息。\n\n【批判性思考】\n交叉注意力和自注意力有什么区别？\n• 自注意力：Q、K、V 来自同一个序列\n• 交叉注意力：Q 来自一个序列，K、V 来自另一个序列\n\n交叉注意力就像「翻译」：\n• Query：目标语言的当前词（「我在找什么翻译？」）\n• Key：源语言的所有词（「这些词能提供什么信息？」）\n• Value：源语言的所有词（「这些词的实际内容」）\n\n这就是机器翻译的核心机制。",
  },
  {
    stepNumber: 10,
    title: "计算复杂度分析",
    formula:
      "\\text{Self-Attention: } O(n^2 \\cdot d), \\quad \\text{FFN: } O(n \\cdot d^2) \\\\ \\text{当 } n \\gg d \\text{ 时，注意力成为主要瓶颈}",
    explanation:
      "自注意力的复杂度是序列长度的平方 O(n²·d)，这是 Transformer 处理长序列时的根本瓶颈。相比之下，FFN 的复杂度 O(n·d²) 与序列长度 n 呈线性关系，序列变长时注意力占主导。\n\n【批判性思考】\nO(n²) 的复杂度意味着什么？\n• 序列长度翻倍 → 计算量翻 4 倍\n• 序列长度 10 倍 → 计算量 100 倍\n\n对于 GPT-4（假设支持 128K token）：\n• 注意力矩阵大小 = 128K × 128K = 160 亿元素\n• 每个元素需要一次乘法和一次加法\n\n这就是为什么长序列处理这么困难！\n\n解决方案：\n• Flash Attention：优化内存访问模式，加速 2-4 倍\n• 稀疏注意力：只计算部分位置对，如 Longformer\n• 线性注意力：用核函数近似，如 Linear Transformer\n• 分块处理：把长序列分成小块，如 BigBird",
  },
];

const backpropDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "计算图的节点分解",
    formula:
      "\\text{Forward: } z = W \\cdot x + b, \\quad a = \\sigma(z), \\quad L = \\text{Loss}(a, y)",
    explanation:
      "将神经网络的前向传播分解为一系列基本计算节点。每个节点接收输入、执行简单运算、产生输出。反向传播就是沿着这些节点反向计算梯度——每个节点只需知道它的局部梯度。\n\n【批判性思考】\n为什么要把计算分解成节点？\n因为这样可以实现「模块化」——每个节点只需要知道自己的局部梯度，不需要知道整个网络的结构。\n\n这就像：\n• 你不需要知道整个公司怎么运作\n• 你只需要知道自己的工作职责\n• 每个部门独立运作，通过接口协作\n\n反向传播的美妙之处在于：每个节点只需要「局部信息」就能计算全局梯度。",
    animation: { type: "video", videoPath: "/videos/gradient-backpropagation.mp4" },
  },
  {
    stepNumber: 2,
    title: "局部梯度与上游梯度",
    formula:
      "\\frac{\\partial L}{\\partial x} = \\underbrace{\\frac{\\partial L}{\\partial z}}_{\\text{上游梯度}} \\cdot \\underbrace{\\frac{\\partial z}{\\partial x}}_{\\text{局部梯度}}",
    explanation:
      "反向传播的核心思想：每个节点只需计算其输出对输入的局部梯度，然后乘以上游传来的梯度。这种局部计算模式使梯度可以通过任意复杂的图结构传播。\n\n【批判性思考】\n这个公式揭示了什么？\n梯度是「链式法则」的直接应用：\n• 上游梯度：损失对当前节点输出的梯度\n• 局部梯度：当前节点输出对输入的梯度\n• 两者相乘：损失对当前节点输入的梯度\n\n这就像「接力赛」：\n• 每个节点从上游接过梯度\n• 乘以自己的局部梯度\n• 传给下游\n\n整个过程是「局部」的，但效果是「全局」的。",
  },
  {
    stepNumber: 3,
    title: "交叉熵损失函数梯度",
    formula:
      "L = -\\frac{1}{N} \\sum_{i=1}^N \\left[ y_i \\log \\hat{y}_i + (1 - y_i) \\log(1 - \\hat{y}_i) \\right], \\quad \\frac{\\partial L}{\\partial z} = \\hat{y} - y",
    explanation:
      "交叉熵损失与 Softmax 的组合有一个极简洁的梯度形式：梯度等于模型预测减去真实标签。这个优雅的性质使分类问题的反向传播实现非常简单高效。\n\n【批判性思考】\n为什么交叉熵的梯度这么简洁？\n因为 Softmax 和交叉熵的组合在数学上是「共轭」的。\n\n推导过程：\n1. Softmax: ŷᵢ = exp(zᵢ) / Σ exp(zⱼ)\n2. 交叉熵: L = -Σ yᵢ log(ŷᵢ)\n3. ∂L/∂zᵢ = ŷᵢ - yᵢ\n\n这个简洁的结果不是巧合，而是精心设计的——选择 Softmax + 交叉熵就是为了这个优雅的梯度。\n\n如果用其他损失函数（如 MSE），梯度会复杂得多。",
  },
  {
    stepNumber: 4,
    title: "线性层的梯度传播",
    formula:
      "z = W \\cdot x + b, \\quad \\frac{\\partial L}{\\partial W} = \\frac{\\partial L}{\\partial z} \\cdot x^T, \\quad \\frac{\\partial L}{\\partial x} = W^T \\cdot \\frac{\\partial L}{\\partial z}, \\quad \\frac{\\partial L}{\\partial b} = \\frac{\\partial L}{\\partial z}",
    explanation:
      "线性层有三个梯度：对权重 W 的梯度用于参数更新（上游梯度与输入的外积），对输入 x 的梯度继续向上一层传播，对偏置 b 的梯度等于上游梯度的和。\n\n【批判性思考】\n这三个梯度有什么关系？\n• ∂L/∂W：用于更新权重（「学习」）\n• ∂L/∂x：传给上一层（「传播」）\n• ∂L/∂b：用于更新偏置（「学习」）\n\n注意 ∂L/∂x = W^T · ∂L/∂z：\n• 梯度传播需要转置 W\n• 这就是为什么反向传播需要「转置」操作\n• 这也是为什么反向传播的计算量和前向传播差不多",
  },
  {
    stepNumber: 5,
    title: "激活函数的梯度",
    formula:
      "a = \\text{ReLU}(z), \\quad \\frac{\\partial a}{\\partial z} = \\begin{cases} 1 & z > 0 \\\\ 0 & z \\leq 0 \\end{cases} \\\\ a = \\sigma(z), \\quad \\frac{\\partial a}{\\partial z} = a \\cdot (1 - a)",
    explanation:
      "不同激活函数的局部梯度差异巨大。ReLU 在正区间梯度恒为 1，不缩小梯度幅度。Sigmoid 在饱和区梯度趋近于 0——这就是深度网络倾向于使用 ReLU 族激活函数的原因。\n\n【批判性思考】\nReLU 有一个问题：死亡 ReLU（Dying ReLU）。\n\n当输入为负数时，ReLU 的梯度为 0。如果一个神经元的输入总是负数，它的梯度永远是 0，永远无法更新——这个神经元「死了」。\n\n解决方案：\n• Leaky ReLU：负数区域给一个小梯度（如 0.01）\n• PReLU：负数区域的斜率可学习\n• ELU：负数区域给一个平滑的曲线\n• GELU：高斯误差线性单元，GPT 使用\n\n这些变体都是为了解决死亡 ReLU 问题。",
  },
  {
    stepNumber: 6,
    title: "链式法则的递归展开",
    formula:
      "\\frac{\\partial L}{\\partial W^{(l)}} = \\frac{\\partial L}{\\partial a^{(L)}} \\cdot \\left( \\prod_{k=l}^{L-1} \\frac{\\partial a^{(k+1)}}{\\partial z^{(k+1)}} \\cdot \\frac{\\partial z^{(k+1)}}{\\partial a^{(k)}} \\right) \\cdot \\frac{\\partial a^{(l)}}{\\partial z^{(l)}} \\cdot \\frac{\\partial z^{(l)}}{\\partial W^{(l)}}",
    explanation:
      "展开后可见第 l 层的梯度是输出层到 l+1 层之间所有雅可比矩阵的连乘。若雅可比矩阵范数小于 1，连乘导致梯度指数衰减（消失）；大于 1 则指数增长（爆炸）。\n\n【批判性思考】\n这个公式揭示了深度学习的核心挑战：\n\n梯度是「连乘」的，所以：\n• 如果每层的雅可比矩阵范数 < 1 → 梯度指数衰减（消失）\n• 如果每层的雅可比矩阵范数 > 1 → 梯度指数增长（爆炸）\n\n这就像：\n• 每传一层，信号就衰减一点\n• 传了 10 层后，信号就衰减到几乎为 0\n\n这就是为什么深度网络难以训练——梯度信号在传播过程中消失了。",
  },
  {
    stepNumber: 7,
    title: "梯度消失的数值示例",
    formula:
      "\\text{10 层 Sigmoid 网络: } \\left\\| \\frac{\\partial L}{\\partial W^{(1)}} \\right\\| \\approx (0.25)^{10} \\cdot \\left\\| \\frac{\\partial L}{\\partial W^{(10)}} \\right\\| \\approx 10^{-6} \\cdot \\left\\| \\frac{\\partial L}{\\partial W^{(10)}} \\right\\|",
    explanation:
      "对于一个 10 层的 Sigmoid 网络，每层梯度收缩约 0.25 倍，传到第一层时梯度缩小到百万分之一。这意味着浅层网络权重几乎无法更新——这是深度网络长期难以训练的根本原因。\n\n【批判性思考】\n为什么 Sigmoid 的梯度是 0.25？\n因为 Sigmoid 的导数 σ'(x) = σ(x)(1-σ(x))，最大值是 0.25（当 x=0 时）。\n\n这意味着：\n• 每层至少损失 75% 的梯度\n• 10 层后：0.25^10 ≈ 0.000001\n• 20 层后：0.25^20 ≈ 0.000000000001\n\n这就是为什么：\n• 2012 年之前，深度网络很难训练超过 10 层\n• 2015 年 ResNet 出现后，可以训练 100+ 层\n• 关键突破：残差连接让梯度可以「跳过」中间层",
  },
  {
    stepNumber: 8,
    title: "梯度下降参数更新",
    formula:
      "W^{(t+1)} = W^{(t)} - \\eta \\cdot \\frac{\\partial L}{\\partial W^{(t)}}, \\quad \\eta > 0",
    explanation:
      "梯度下降是最简单的优化方法：沿负梯度方向迈出步长为 η 的更新。学习率 η 是关键超参数——太大可能导致发散，太小则收敛过慢。实践中通常从 1e-3 到 1e-5 范围内调优。\n\n【批判性思考】\n为什么是「负」梯度？\n因为梯度指向函数值增长最快的方向，而我们要最小化损失函数，所以要往反方向走。\n\n为什么学习率这么重要？\n• 太大：更新步长太大，可能跳过最小值，甚至发散\n• 太小：更新步长太小，训练太慢，可能卡在局部极小值\n\n这就像开车：\n• 油门太大：可能冲出跑道\n• 油门太小：可能永远到不了目的地\n\n实际中，学习率需要仔细调整，通常从 1e-3 开始，然后根据训练情况调整。",
  },
  {
    stepNumber: 9,
    title: "带动量的梯度下降",
    formula:
      "v_{t+1} = \\beta \\cdot v_t + (1 - \\beta) \\cdot \\nabla L(W_t), \\quad W_{t+1} = W_t - \\eta \\cdot v_{t+1}",
    explanation:
      "动量法引入速度项 v，累积历史梯度的指数衰减移动平均。β 通常取 0.9。动量能加速收敛、越过局部极小值和平坦区域，尤其在损失函数存在狭窄峡谷时效果显著。\n\n【批判性思考】\n动量的本质是什么？\n它就像「惯性」——球从山上滚下来，不会在山谷底部停下来，而是会继续滚动，可能滚到更低的山谷。\n\n为什么动量能逃离局部极小值？\n因为动量累积了历史梯度，即使当前梯度很小（在局部极小值底部），动量可能仍然很大，推动参数继续移动。\n\n但动量也有问题：\n• 可能冲过最小值\n• 需要仔细调整 β\n\n实际中，动量通常和学习率调度一起使用。",
  },
  {
    stepNumber: 10,
    title: "Adam 优化器",
    formula:
      "m_t = \\beta_1 m_{t-1} + (1 - \\beta_1) g_t, \\quad v_t = \\beta_2 v_{t-1} + (1 - \\beta_2) g_t^2 \\\\ \\hat{m}_t = \\frac{m_t}{1 - \\beta_1^t}, \\quad \\hat{v}_t = \\frac{v_t}{1 - \\beta_2^t}, \\quad \\theta_{t+1} = \\theta_t - \\eta \\cdot \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon}",
    explanation:
      "Adam 融合动量和自适应学习率：m 是一阶矩估计，v 是二阶矩估计。除以 √v 使每个参数有独立的自适应学习率。偏差校正项确保训练初期估计不偏小。默认 β₁=0.9, β₂=0.999, ε=1e-8。\n\n【批判性思考】\nAdam 为什么这么好用？\n因为它解决了 SGD 的两个问题：\n1. 动量：加速收敛，逃离局部极小值\n2. 自适应学习率：每个参数用不同的学习率\n\n但 Adam 也有问题：\n1. 内存占用：需要存储 m 和 v（2 倍参数量）\n2. 泛化可能不如 SGD：有些研究表明 SGD 的泛化更好\n3. 超参数敏感：β₁、β₂、ε 需要仔细调整\n\n实际选择：\n• 小模型、快速实验 → Adam\n• 大模型、追求最佳性能 → SGD + Momentum\n• 最新研究：AdamW（权重衰减修正）",
  },
  {
    stepNumber: 11,
    title: "梯度裁剪 (Gradient Clipping)",
    formula:
      "g \\leftarrow \\begin{cases} g \\cdot \\frac{\\text{threshold}}{\\|g\\|} & \\|g\\| > \\text{threshold} \\\\ g & \\text{otherwise} \\end{cases}",
    explanation:
      "梯度裁剪在更新前将梯度的 L2 范数限制在阈值内。这是对抗梯度爆炸的标准方法，对 RNN 训练至关重要。阈值通常在 1.0 到 10.0 之间。\n\n【批判性思考】\n为什么需要梯度裁剪？\n因为梯度可能突然变得很大（梯度爆炸），导致参数更新过大，训练不稳定。\n\n这就像：\n• 你在开车，突然遇到一个大下坡\n• 如果不踩刹车，速度会越来越快，可能失控\n• 梯度裁剪就是「刹车」——限制速度，保持稳定\n\n但梯度裁剪也有问题：\n• 阈值太小：可能过度限制，训练变慢\n• 阈值太大：可能无法有效防止爆炸\n\n实际中，阈值需要根据具体任务调整。",
  },
  {
    stepNumber: 12,
    title: "学习率调度策略",
    formula:
      "\\eta_t = \\eta_{\\text{min}} + \\frac{1}{2}(\\eta_{\\text{max}} - \\eta_{\\text{min}})\\left(1 + \\cos\\left(\\frac{t}{T}\\pi\\right)\\right) \\quad \\text{(余弦退火)}",
    explanation:
      "学习率调度动态调整步长。余弦退火先保持高学习率快速探索后逐渐降低精细收敛。Transformer 特有的 warmup 在前几步从零线性增加到目标学习率，防止早期梯度不稳定。\n\n【批判性思考】\n为什么需要学习率调度？\n因为固定学习率很难同时满足：\n• 训练初期：需要大学习率快速探索\n• 训练后期：需要小学习率精细调整\n\n余弦退火解决了这个问题：\n• 开始：大学习率（快速探索）\n• 中间：逐渐减小（稳定收敛）\n• 结束：小学习率（精细调整）\n\n但余弦退火也有局限：\n• 假设训练过程是平滑的\n• 无法适应突然的损失变化\n\n实际中，还有其他调度策略：\n• Step Decay：每隔 N 步减半\n• Exponential Decay：指数衰减\n• ReduceLROnPlateau：当损失不再下降时减小",
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
    formula: "h = W_0 \\cdot x + \\Delta W \\cdot x = W_0 \\cdot x + A \\cdot (B \\cdot x)",
    explanation:
      "LoRA 前向传播先通过 B 投影到低维空间（瓶颈），再通过 A 投影回原始维度。瓶颈结构强制 ΔW 学习输入输出之间的低秩变换。计算 B→x 而非 A·B 先乘，减少计算量。",
  },
  {
    stepNumber: 6,
    title: "推理时适配器合并",
    formula: "W_{\\text{merged}} = W_0 + \\frac{\\alpha}{r} \\cdot A \\cdot B",
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
    title: "什么是向量？——一个数字列表",
    formula: "\\mathbf{v} = \\begin{bmatrix} 3 \\\\ 5 \\\\ 7 \\end{bmatrix} \\in \\mathbb{R}^3",
    explanation:
      "想象你去超市买东西，购物清单上写着：苹果 3 个、香蕉 5 根、牛奶 7 盒。把这三个数字排成一排，就是一个「向量」。\n\n就这么简单——向量就是一组数字。\n\n为什么要用向量？因为计算机处理一组数字特别快。如果你要记录一个人的信息（年龄、身高、体重），用一个向量 [25, 170, 65] 就搞定了。\n\n在 AI 里，每个「词」都被转换成一个长长的向量，比如「猫」可能是 [0.2, -0.5, 0.8, ...]（几百个数字），「狗」可能是 [0.3, -0.4, 0.7, ...]。两个词越像，它们的向量就越接近。\n\n就像你和好朋友有很多共同点一样，「猫」和「狗」的向量也很接近，因为它们都是宠物。\n\n【批判性思考】\n为什么向量能表示词的含义？因为语言学家发现：一个词的含义由它的上下文决定（分布式假设）。比如「猫」和「狗」经常出现在相似的上下文中（「喂猫」「喂狗」「猫粮」「狗粮」），所以它们的向量会很接近。这就是 Word2Vec 的核心思想。",
    animation: { type: "video", videoPath: "/videos/vector-shopping-list.mp4" },
  },
  {
    stepNumber: 2,
    title: "什么是矩阵？——一个数字表格",
    formula:
      "A = \\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\end{bmatrix} \\in \\mathbb{R}^{2 \\times 3}",
    explanation:
      "如果向量是一排数字，那矩阵就是把好几排数字叠在一起，变成一个表格。\n\n比如一个班级的成绩表：\n• 小明：语文 90、数学 85、英语 92\n• 小红：语文 88、数学 95、英语 90\n\n这就构成了一个 2×3 的矩阵（2 行 3 列）。\n\n在 AI 里，矩阵无处不在：\n• 一张图片就是一个数字矩阵（每个像素是一个数字）\n• 神经网络的「权重」就是一个大矩阵——它决定了信息怎么流动\n• 一个班所有同学的成绩可以放在一个矩阵里一起处理\n\n就像你用表格整理信息一样，AI 也用矩阵来整理和处理数据。\n\n【批判性思考】\n为什么用矩阵而不是单独处理每个数字？因为矩阵运算可以并行化！GPU 就是专门设计来同时处理大量矩阵运算的。一张 NVIDIA A100 显卡每秒可以做 312 万亿次浮点运算（312 TFLOPS），这就是为什么大模型训练需要昂贵的 GPU 集群。",
  },
  {
    stepNumber: 3,
    title: "矩阵乘法——AI 的核心运算",
    formula: "C_{ij} = \\sum_{k=1}^m A_{ik} \\cdot B_{kj}",
    explanation:
      "矩阵乘法听起来很复杂，但核心思想就是：拿 A 的每一行和 B 的每一列，对应数字相乘再加起来。\n\n打个比方：\n• A 的一行是「小明的各科成绩」[90, 85, 92]\n• B 的一列是「各科的学分」[3, 4, 2]\n• 相乘再相加 = 90×3 + 85×4 + 92×2 = 小明的加权总分\n\n这就是矩阵乘法的本质——批量计算加权和。\n\n为什么 AI 离不开它？因为神经网络的每一层本质上就是一次矩阵乘法：\n输出 = 权重矩阵 × 输入向量\n\nChatGPT 之所以能回答问题，就是因为背后有成千上万次这样的矩阵乘法在运转。\n\n就像你用计算器算总分一样，AI 用矩阵乘法来「计算」答案。\n\n【批判性思考】\n矩阵乘法的计算复杂度是 O(n³)——如果矩阵是 n×n 的，就需要 n³ 次乘法。对于 GPT-3 的 1750 亿参数，这意味着天文数字的计算量。所以科学家们在研究：\n1. 稀疏矩阵：只计算非零元素\n2. 低秩近似：用小矩阵近似大矩阵\n3. 量化：用低精度数字计算\n这些技术让大模型能在消费级硬件上运行。",
  },
  {
    stepNumber: 4,
    title: "转置——把表格翻个身",
    formula:
      "A^T = \\begin{bmatrix} 1 & 4 \\\\ 2 & 5 \\\\ 3 & 6 \\end{bmatrix}, \\quad \\text{原来的行变成列}",
    explanation:
      "转置就是把矩阵「横着看变成竖着看」。\n\n想象一张表：\n```\n      语文  数学  英语\n小明   90    85    92\n小红   88    95    90\n```\n\n转置后变成：\n```\n      小明  小红\n语文   90    88\n数学   85    95\n英语   92    90\n```\n\n原来按「人」排列的，现在按「科目」排列了。\n\n就像你把书架上的书从「横着放」变成「竖着放」一样，转置只是改变了数据的排列方式。\n\n在 AI 里，转置经常用在注意力机制中：计算「谁该关注谁」时，需要把 Key 矩阵转置，这样才能和 Query 相乘。\n\n【批判性思考】\n为什么转置这么重要？因为矩阵乘法对顺序很敏感：A×B ≠ B×A。转置让我们可以灵活地调整矩阵的「方向」，从而实现不同的计算目标。比如在注意力机制中：\n• Query × Key^T = 注意力分数\n• 这里 Key^T 的转置让 Q 和 K 可以做内积运算",
  },
  {
    stepNumber: 5,
    title: "点积——衡量两个向量有多像",
    formula: "\\mathbf{a} \\cdot \\mathbf{b} = a_1 b_1 + a_2 b_2 + \\dots + a_n b_n",
    explanation:
      "点积就是两个向量「对应位置相乘再全部加起来」。\n\n例子：\n• 向量 A = [1, 2, 3]（小明：语文1分、数学2分、英语3分）\n• 向量 B = [3, 2, 1]（权重：语文3分、数学2分、英语1分）\n• A·B = 1×3 + 2×2 + 3×1 = 10\n\n点积越大，说明两个向量越「匹配」。\n\n就像你和好朋友有很多共同点一样，两个相似的向量点积会很大。\n\n在 AI 里的用途：\n• 搜索引擎用点积判断你的搜索词和哪个网页最相关\n• 推荐系统用点积判断你可能喜欢哪个商品\n• ChatGPT 用点积（注意力机制）判断每个词应该「关注」其他哪些词\n\n【批判性思考】\n点积有一个重要性质：a·b = |a|×|b|×cos(θ)，其中 θ 是两个向量的夹角。\n• 如果两个向量方向相同（θ=0°），cos(θ)=1，点积最大\n• 如果两个向量垂直（θ=90°），cos(θ)=0，点积为 0\n• 如果两个向量方向相反（θ=180°），cos(θ)=-1，点积最小\n\n这就是为什么点积能衡量「相似度」——它本质上是在测量两个向量的方向一致性。",
    animation: { type: "video", videoPath: "/videos/dot-product-intuition.mp4" },
  },
  {
    stepNumber: 6,
    title: "特征值分解——矩阵的「DNA」",
    formula: "A\\mathbf{v} = \\lambda\\mathbf{v}, \\quad \\det(A - \\lambda I) = 0",
    explanation:
      "特征值分解是线性代数中最深刻的概念之一。\n\n简单说：对于某些特殊的向量 v，矩阵 A 的作用只是拉伸或压缩，而不改变方向。这些特殊的向量就是「特征向量」，拉伸/压缩的倍数就是「特征值」。\n\n打个比方：\n• 把一块橡皮泥拉伸成椭圆形\n• 长轴方向就是特征向量，拉伸倍数就是特征值\n• 短轴方向也是特征向量，压缩倍数也是特征值\n\n在 AI 里的应用：\n• 主成分分析（PCA）：找到数据变化最大的方向\n• 降维：把高维数据投影到最重要的方向\n• 理解模型：分析神经网络权重矩阵的特性\n\n【批判性思考】\n为什么特征值分解这么重要？因为任何方阵都可以分解为：\nA = P × D × P⁻¹\n其中 P 是特征向量矩阵，D 是特征值对角矩阵。\n\n这意味着矩阵的「本质」就是它对不同方向的拉伸/压缩。理解了这一点，就能理解为什么有些矩阵运算可以简化，为什么有些神经网络层可以压缩，为什么 SVD 分解如此强大。",
    animation: { type: "matrix" },
  },
];

// ch1_lesson2 — 微积分基础
const calculusDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "导数 = 变化的速度",
    formula: "f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}",
    animation: { type: "video", videoPath: "/videos/derivative-as-slope.mp4" },
    explanation:
      "想象你在骑自行车。速度计显示你当前的速度是 15 km/h。\n\n这个「速度」就是导数！它告诉你位置变化得有多快。\n\n导数 f'(x) 就是函数在某个点的「瞬时变化率」——就像速度计显示你此刻的速度一样。\n\n在 AI 里，导数告诉我们：如果稍微调整一下参数，模型的表现会变好还是变坏。\n\n就像下山时，导数告诉你往哪个方向走最陡——往那个方向走，你就能最快地下山。\n\n【批判性思考】\n为什么导数是「极限」而不是「差值」？\n因为差值只能告诉你「平均变化率」，而导数告诉你「瞬时变化率」。\n\n比如：\n• 你从 A 地到 B 地用了 2 小时，平均速度 = 距离/时间 = 60 km/h\n• 但某一瞬间你可能开到 100 km/h，也可能停在红灯前（0 km/h）\n• 导数就是那个「瞬时」的速度\n\n这个「极限」的概念是微积分的基础——它让我们能精确描述「变化」。",
  },
  {
    stepNumber: 2,
    title: "基本导数法则",
    formula:
      "\\frac{d}{dx}[c] = 0, \\quad \\frac{d}{dx}[x^n] = n x^{n-1}, \\quad \\frac{d}{dx}[e^x] = e^x, \\quad \\frac{d}{dx}[\\ln x] = \\frac{1}{x}",
    explanation:
      "导数有一些简单的计算规则，就像数学里的口诀一样：\n\n• 常数的导数是 0 → 因为常数不变，变化率为 0\n• x² 的导数是 2x → 指数降下来，指数减 1\n• eˣ 的导数还是 eˣ → 这是个神奇的函数！\n• ln(x) 的导数是 1/x → 对数的导数是倒数\n\n这些规则就像积木一样，可以组合起来计算复杂函数的导数。\n\n【批判性思考】\n为什么 eˣ 的导数还是 eˣ？\n因为 e 是唯一一个满足 f'(x) = f(x) 的函数（除了常数倍）。\n\n这意味着：e 的指数函数的变化率等于它自己！\n• 如果 f(x) = eˣ，那么 f'(x) = eˣ = f(x)\n• 这就是为什么 e 在自然界中无处不在（人口增长、放射性衰变、复利计算）\n\n在 AI 里，Softmax 函数使用 e 的指数，就是因为它的导数性质很好。",
  },
  {
    stepNumber: 3,
    title: "链式法则 (复合函数)",
    formula: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}, \\quad y = y(u(x))",
    explanation:
      "链式法则是微积分里最重要的法则之一。\n\n想象你在玩「套娃」：\n• 最里面是 x\n• x 外面包着 u\n• u 外面包着 y\n\n要计算 y 对 x 的变化率，就像一层层剥开套娃：\ny 对 u 的变化率 × u 对 x 的变化率\n\n在 AI 里，神经网络就像一个超级大的套娃——每一层都是对上一层的包装。链式法则让 AI 能一层层地「学习」。\n\n动画演示：看这个梯度流动的动画，就像水流从山顶流到山脚一样。\n\n【批判性思考】\n为什么链式法则这么重要？\n因为深度学习的本质就是「复合函数」——每一层都是对上一层的函数包装。\n\n比如一个 3 层网络：\n• 第 1 层：y₁ = f₁(x)\n• 第 2 层：y₂ = f₂(y₁)\n• 第 3 层：y₃ = f₃(y₂)\n\n要训练这个网络，需要计算损失 L 对每个参数的梯度。链式法则让我们可以：\n∂L/∂w₁ = ∂L/∂y₃ × ∂y₃/∂y₂ × ∂y₂/∂y₁ × ∂y₁/∂w₁\n\n这就是「反向传播」的数学基础！",
    animation: { type: "gradient" },
  },
  {
    stepNumber: 4,
    title: "链式法则的复合展开",
    formula: "\\frac{d}{dx} f(g(h(x))) = f'(g(h(x))) \\cdot g'(h(x)) \\cdot h'(x)",
    explanation:
      "当套娃有更多层时，链式法则就继续乘下去：\n\ny = f(g(h(x)))\n→ y 对 x 的导数 = f' × g' × h'\n\n每一层都要乘一次。这就是为什么深度网络训练需要很多计算——每一层都要「学习」自己的部分。\n\n【批判性思考】\n链式法则有一个严重的问题：梯度消失。\n\n假设每层的导数都是 0.5（小于 1）：\n• 10 层后：0.5¹⁰ ≈ 0.001\n• 20 层后：0.5²⁰ ≈ 0.000001\n\n梯度指数级衰减！这意味着浅层的参数几乎收不到梯度信号，无法学习。\n\n这就是为什么：\n• 深度网络难以训练\n• 需要残差连接（ResNet）\n• 需要特殊的初始化方法\n• 需要 BatchNorm / LayerNorm\n\n这些技术都是为了解决梯度消失问题。",
  },
  {
    stepNumber: 5,
    title: "偏导数",
    formula:
      "\\frac{\\partial f}{\\partial x_i} = \\lim_{h \\to 0} \\frac{f(x_1, \\dots, x_i + h, \\dots, x_n) - f(x_1, \\dots, x_n)}{h}",
    explanation:
      "偏导数是导数的「升级版」——当函数有多个变量时使用。\n\n想象你在调空调温度：\n• 温度太高 → 降低温度\n• 湿度太高 → 降低湿度\n\n每个变量都有自己的「调节方向」，这就是偏导数。\n\n在 AI 里，模型有成千上万个参数，每个参数都有自己的偏导数，告诉 AI 该怎么调整这个参数。\n\n【批判性思考】\n偏导数告诉我们「局部」的变化率，但梯度告诉我们「全局最优」的方向。\n\n比如：\n• ∂f/∂x = 0 不一定意味着 f 取得最大值或最小值\n• 可能是鞍点（一个方向是最大值，另一个方向是最小值）\n\n在高维空间中，鞍点比局部极小值更常见！这就是为什么：\n• 梯度下降可能卡在鞍点\n• 需要动量（Momentum）来逃离鞍点\n• 需要更高级的优化器（如 Adam）",
  },
  {
    stepNumber: 6,
    title: "多元链式法则 (雅可比矩阵)",
    formula:
      "\\frac{\\partial L}{\\partial x_i} = \\sum_{j=1}^m \\frac{\\partial L}{\\partial y_j} \\cdot \\frac{\\partial y_j}{\\partial x_i}, \\quad \\text{向量形式: } \\nabla_x L = (J_y(x))^T \\cdot \\nabla_y L",
    explanation:
      "当有多个变量时，链式法则变得更复杂，但思想还是一样的：\n\n把所有可能的路径都考虑进去，然后加起来。\n\n就像你从家到学校有好几条路，要计算总距离就要把每条路的距离都加起来。\n\n雅可比矩阵就像一张「地图」，记录了所有变量之间的关系。\n\n【批判性思考】\n雅可比矩阵的计算复杂度是 O(m×n)，其中 m 和 n 是输入输出的维度。\n\n对于大模型：\n• 输入维度 n = 4096\n• 输出维度 m = 4096\n• 雅可比矩阵大小 = 4096 × 4096 = 1600 万元素\n\n这就是为什么反向传播需要大量显存——我们需要存储和计算这些巨大的雅可比矩阵。\n\n解决方案：\n• 梯度检查点（Gradient Checkpointing）：用计算换显存\n• 混合精度训练：用 FP16 减少内存占用\n• ZeRO 优化：分布式训练，把梯度分片存储",
  },
  {
    stepNumber: 7,
    title: "梯度向量",
    formula:
      "\\nabla f = \\begin{bmatrix} \\frac{\\partial f}{\\partial x_1} & \\frac{\\partial f}{\\partial x_2} & \\cdots & \\frac{\\partial f}{\\partial x_n} \\end{bmatrix}^T",
    explanation:
      "梯度就是把所有偏导数组合在一起，变成一个向量。\n\n这个向量指向函数值增长最快的方向。\n\n想象你在山上：\n• 梯度指向最陡的上坡方向\n• 负梯度指向最陡的下坡方向\n\nAI 就是沿着负梯度方向「下山」，找到损失最小的地方。\n\n动画演示：看这个梯度流动的动画，就像水流从山顶流到山脚一样。\n\n【批判性思考】\n梯度指向「局部」最陡方向，但不一定是「全局」最优方向。\n\n这就像你在山里蒙眼下山：\n• 你只能感觉到脚下的坡度\n• 你可能走到一个小山谷（局部极小值）\n• 而不是整个山脉的最低点（全局最小值）\n\n在深度学习中：\n• 损失函数有无数个局部极小值和鞍点\n• 不同的初始化会导致不同的最终结果\n• 这就是为什么训练深度网络需要多次尝试\n• 这就是为什么「随机初始化」很重要——它让你从不同的起点开始",
    animation: { type: "video", videoPath: "/videos/chain-rule-flow.mp4" },
  },
  {
    stepNumber: 8,
    title: "梯度下降迭代公式",
    formula: "\\theta^{(t+1)} = \\theta^{(t)} - \\eta \\cdot \\nabla L(\\theta^{(t)})",
    explanation:
      "梯度下降就像「蒙眼下山」：\n\n1. 摸摸脚下的坡度（计算梯度）\n2. 往最陡的下坡方向走一步（更新参数）\n3. 重复，直到走到山谷（损失最小）\n\n学习率 η 就是「步长」：\n• 太大 → 可能走过头，到不了山谷\n• 太小 → 走得太慢，要很久才能到\n\n这是 AI 学习的核心方法！\n\n【批判性思考】\n学习率是深度学习中最重要的超参数之一。\n\n问题：学习率应该设多大？\n• 太小：训练慢，可能卡在局部极小值\n• 太大：训练不稳定，可能发散\n\n解决方案：学习率调度（Learning Rate Schedule）\n• Warmup：先用小学习率，逐渐增大\n• Cosine Annealing：余弦退火，周期性调整\n• ReduceLROnPlateau：当损失不再下降时减小学习率\n\n现代实践：通常从 1e-4 到 1e-3 开始，然后根据训练情况调整。",
    animation: { type: "video", videoPath: "/videos/gradient-descent-intuition.mp4" },
  },
  {
    stepNumber: 9,
    title: "从梯度下降到 Adam",
    formula:
      "\\text{SGD: } \\theta_{t+1} = \\theta_t - \\eta g_t \\\\ \\text{Momentum: } v_{t+1} = \\beta v_t + g_t, \\quad \\theta_{t+1} = \\theta_t - \\eta v_{t+1} \\\\ \\text{Adam: } \\theta_{t+1} = \\theta_t - \\eta \\frac{m_t}{\\sqrt{v_t} + \\epsilon}",
    explanation:
      "梯度下降有很多「升级版」，让 AI 学得更快更好：\n\n• SGD（随机梯度下降）→ 基本版，但有时会「左右摇摆」\n• Momentum（动量）→ 加了「惯性」，走得更稳\n• Adam → 最聪明的版本，给每个参数不同的学习率\n\n就像开车：\n• SGD → 踩油门就走，松油门就停\n• Momentum → 有惯性，松油门还会滑一段\n• Adam → 智能驾驶，自动调节速度\n\n【批判性思考】\nAdam 虽然好用，但也有问题：\n1. 可能泛化不如 SGD：有些研究表明 SGD 的泛化更好\n2. 内存占用大：需要存储一阶矩和二阶矩（2 倍参数量）\n3. 超参数敏感：β₁、β₂、ε 需要仔细调整\n\n实际选择：\n• 小模型、快速实验 → Adam\n• 大模型、追求最佳性能 → SGD + Momentum\n• 最新研究：AdamW（权重衰减修正）",
  },
  {
    stepNumber: 10,
    title: "二阶导数与曲率",
    formula:
      "f''(x) = \\lim_{h \\to 0} \\frac{f'(x + h) - f'(x)}{h}, \\quad \\text{Hessian: } H_{ij} = \\frac{\\partial^2 f}{\\partial x_i \\partial x_j}",
    explanation:
      "二阶导数是「导数的导数」——它告诉你导数变化得有多快。\n\n想象你在开车：\n• 一阶导数 → 速度（位置的变化率）\n• 二阶导数 → 加速度（速度的变化率）\n\n在 AI 里，二阶导数帮助我们了解损失函数的「弯曲程度」：\n• 弯曲大 → 需要小步走\n• 弯曲小 → 可以大步走\n\nHessian 矩阵记录了所有参数的二阶导数信息。\n\n【批判性思考】\n为什么我们不用二阶优化方法（如牛顿法）？\n\n因为 Hessian 矩阵的计算复杂度是 O(n²)，存储复杂度是 O(n²)。\n\n对于 GPT-3（1750 亿参数）：\n• Hessian 大小 = 1750 亿 × 1750 亿 = 3 × 10²² 元素\n• 这比宇宙中的星星还多！\n\n所以实际中：\n• 一阶方法（SGD、Adam）是主流\n• 二阶方法只用于小模型或特殊场景\n• 近似方法（如 L-BFGS）可以减少计算量\n\n这就是为什么深度学习主要依赖一阶优化——不是因为二阶不好，而是因为计算量太大。",
  },
];

// ch2_lesson1 — 神经网络入门
const nnBasicDerivationSteps: DerivationStep[] = [
  {
    stepNumber: 1,
    title: "感知器模型——AI 的「小脑袋」",
    formula: "y = \\phi\\left(\\sum_{i=1}^n w_i x_i + b\\right) = \\phi(w \\cdot x + b)",
    explanation:
      "感知器是神经网络的基本单元，就像 AI 的一个「小脑袋」。\n\n它的思考过程很简单：\n1. 接收信息（输入 x）\n2. 给每个信息分配重要性（权重 w）\n3. 加起来（加权求和）\n4. 加上一个「偏置」b（就像考试的加分项）\n5. 通过激活函数 ϕ 决定输出\n\n就像老师评分：\n• 语文成绩 × 30% + 数学成绩 × 40% + 英语成绩 × 30% + 加分项\n• 算出总分后，决定你及格还是不及格\n\n神经网络就是很多个感知器连在一起，像大脑里的神经元一样。",
    animation: { type: "video", videoPath: "/videos/nn-forward-pass.mp4" },
  },
  {
    stepNumber: 2,
    title: "Sigmoid 激活函数——「及格/不及格」判断器",
    formula: "\\sigma(x) = \\frac{1}{1 + e^{-x}}, \\quad \\sigma'(x) = \\sigma(x)(1 - \\sigma(x))",
    explanation:
      "Sigmoid 就像一个「及格/不及格」判断器：\n\n• 输入任何数字\n• 输出一个 0 到 1 之间的数\n• 大于 0.5 → 及格（输出 1）\n• 小于 0.5 → 不及格（输出 0）\n\n这个函数很像人类的判断方式：非黑即白。\n\n但有个问题：如果输入太大或太小，函数就「饱和」了——就像你已经 100 分了，再努力也加不了分。\n\n所以在深度学习里，我们更喜欢用 ReLU。",
  },
  {
    stepNumber: 3,
    title: "ReLU 激活函数——「有/无」判断器",
    formula:
      "\\text{ReLU}(x) = \\max(0, x), \\quad \\text{ReLU}'(x) = \\begin{cases} 1 & x > 0 \\\\ 0 & x \\leq 0 \\end{cases}",
    explanation:
      "ReLU 是现在最常用的激活函数，它超级简单：\n\n• 输入正数 → 输出原数\n• 输入负数或零 → 输出 0\n\n就像一个「开关」：\n• 有信号（正数）→ 通过\n• 没信号（负数）→ 阻断\n\n为什么 ReLU 这么好用？\n• 计算超快（只是一次比较）\n• 不会「饱和」（正数区域梯度恒为 1）\n• 帮助 AI 学得更快\n\n现在的 AI 大模型（比如 ChatGPT）都用 ReLU 或它的变体。",
  },
  {
    stepNumber: 4,
    title: "多层感知器 (MLP)——把小脑袋连起来",
    formula: "h^{(l+1)} = \\sigma\\left(W^{(l)} \\cdot h^{(l)} + b^{(l)}\\right)",
    explanation:
      "一个感知器能力有限，但把很多个感知器连起来，就能解决复杂问题！\n\n多层感知器（MLP）就像：\n• 第一层：接收原始信息（比如图片的像素）\n• 中间层：提取特征（边缘、形状、纹理）\n• 最后一层：做出判断（这是猫还是狗？）\n\n每一层都是上一层的「包装」，就像套娃一样。\n\n层数越多，AI 能处理的问题越复杂：\n• 1 层 → 只能处理简单问题\n• 3 层 → 能识别简单图形\n• 10 层 → 能识别人脸\n• 100+ 层 → 能理解语言、生成文章\n\nChatGPT 有几十层，所以它能理解和生成人类语言。",
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
      'One-Hot 编码将每个词表示为 V 维稀疏向量，维度等于词汇表大小。这不仅维度灾难，且所有向量两两正交，无法表达"苹果"与"香蕉"的语义相似性。我们需要低维稠密向量来编码语义。\n\n【批判性思考】\nOne-Hot 编码的根本问题是什么？\n1. 无法表达语义相似性："猫"和"狗"的 One-Hot 向量点积为 0\n2. 维度灾难：词汇表有 50,000 个词，向量就是 50,000 维\n3. 稀疏性：向量中 99.99% 是 0，计算浪费\n\n解决方案：用低维稠密向量（如 300 维）来表示词，让语义相近的词在向量空间中距离相近。',
  },
  {
    stepNumber: 2,
    title: "嵌入矩阵与查表操作",
    formula: "E \\in \\mathbb{R}^{V \\times d}, \\quad e_i = E[i,:] = E \\cdot \\text{one-hot}(i)",
    explanation:
      "嵌入矩阵 E 的每一行对应一个词的 d 维稠密向量。实际使用时通过查表（lookup）获取词向量而非矩阵乘法——取 E 的第 i 行就是词 i 的嵌入。训练过程中，语义相近的词在嵌入空间中会靠拢。\n\n【批判性思考】\n为什么用查表而不是矩阵乘法？\n因为矩阵乘法的计算量是 O(V×d)，而查表只是 O(1)。\n\n对于 V=50,000, d=300：\n• 矩阵乘法：50,000 × 300 = 1500 万次乘法\n• 查表：1 次内存访问\n\n这就是为什么嵌入层的实现是「查表」而不是「矩阵乘法」——虽然数学上等价，但计算效率差 1500 万倍！",
    animation: { type: "matrix" },
  },
  {
    stepNumber: 3,
    title: "分布式假设与 Word2Vec",
    formula: '\\text{分布式假设: "由它的同伴来知晓这个词" (Firth, 1957)}',
    explanation:
      'Word2Vec 的核心思想源自分布式假设：词的语义由其上下文决定。"国王"常与"王冠""王座""王后"同现，"女王"也共享类似上下文。通过预测词的上下文或根据上下文预测词，模型能学到蕴含语义关系的词向量。\n\n【批判性思考】\n分布式假设有什么局限？\n1. 无法处理一词多义："苹果"（水果）和"苹果"（公司）会得到相同向量\n2. 依赖共现统计：稀有词的向量不准确\n3. 忽略语法结构：只看共现，不看词序\n\n这就是为什么后来发展出：\n• GloVe：加入全局共现统计\n• BERT：使用上下文嵌入，同一个词在不同句子中有不同向量\n• GPT：使用自回归语言模型，考虑词序',
  },
  {
    stepNumber: 4,
    title: "Skip-Gram 模型",
    formula:
      "\\max \\sum_{t=1}^T \\sum_{-c \\leq j \\leq c, j \\neq 0} \\log P(w_{t+j} | w_t), \\quad P(w_O | w_I) = \\frac{\\exp(v_{w_O}'^T v_{w_I})}{\\sum_{w=1}^V \\exp(v_w'^T v_{w_I})}",
    explanation:
      "Skip-Gram 用中心词 w_t 预测上下文词。概率使用 Softmax 定义，v 是输入向量，v' 是输出向量。训练使目标词与上下文词的向量内积增大。窗口大小 c 通常取 5-10，更大的窗口捕捉更广的语义关系。\n\n【批判性思考】\nSkip-Gram 的计算瓶颈是什么？\nSoftmax 的分母需要对所有 V 个词求和！\n\n假设 V=50,000：\n• 每个训练样本需要计算 50,000 次指数\n• 每步训练需要 50,000 × d 次乘法\n\n这就是为什么需要负采样——把 50,000 类分类问题转化为二分类问题。",
  },
  {
    stepNumber: 5,
    title: "负采样 (Negative Sampling)",
    formula:
      "\\log \\sigma(v_{w_O}'^T v_{w_I}) + \\sum_{k=1}^K \\mathbb{E}_{w_k \\sim P_n(w)} \\left[ \\log \\sigma(-v_{w_k}'^T v_{w_I}) \\right]",
    explanation:
      "全词汇表 Softmax 计算成本过高（需对所有 V 个词求和）。负采样将分类问题转化为二分类：最大化正样本概率 × 最小化 K 个随机负样本概率。K 通常取 5-20，小型数据集取更大值。\n\n【批判性思考】\n为什么负采样有效？\n因为训练目标从「预测下一个词」变成了「区分真词和假词」。\n\n这就像：\n• 原问题：从 50,000 个词中选出正确的 1 个\n• 负采样：判断 1 个词是真词还是随机假词\n\n计算量从 O(V) 降到 O(K)，K=5 时加速 10,000 倍！\n\n但负采样有一个假设：负样本应该从「噪声分布」中采样，而不是均匀分布。实际中通常用词频的 3/4 次方作为采样分布。",
  },
  {
    stepNumber: 6,
    title: "GloVe: 全局词共现矩阵",
    formula:
      "J = \\sum_{i,j=1}^V f(X_{ij}) \\left( w_i^T \\tilde{w}_j + b_i + \\tilde{b}_j - \\log X_{ij} \\right)^2",
    explanation:
      "GloVe（Global Vectors）结合了 Word2Vec 的局部上下文方法和矩阵分解的全局统计方法。X_{ij} 是词 i 和 j 的共现计数。加权函数 f 防止高频噪音词的过度影响。训练使词向量内积逼近共现概率的对数。\n\n【批判性思考】\nGloVe 和 Word2Vec 有什么区别？\n• Word2Vec：局部上下文窗口，预测任务\n• GloVe：全局共现统计，矩阵分解任务\n\n哪个更好？\n实验表明：在词类比任务上 GloVe 略好，在词相似度任务上 Word2Vec 略好。但实际上差异不大，两者都能学到很好的词向量。\n\n真正的进步来自 BERT：它不再使用静态词向量，而是使用上下文嵌入——同一个词在不同句子中有不同向量。",
  },
  {
    stepNumber: 7,
    title: "词向量空间中的线性类比推理",
    formula:
      "\\text{国王} - \\text{王后} \\approx \\text{男人} - \\text{女人} \\\\ \\text{法国} - \\text{巴黎} \\approx \\text{日本} - \\text{东京} \\\\ v_{\\text{国王}} - v_{\\text{男人}} + v_{\\text{女人}} \\approx v_{\\text{王后}}",
    explanation:
      '词向量空间展现惊人的线性结构：语义关系通过向量加减表示。国王 - 男人 + 女人 ≈ 王后，法国 - 巴黎 + 东京 ≈ 日本。这表明嵌入空间不仅编码了语义相似性还编码了语义关系的方向一致性。\n\n【批判性思考】\n线性类比推理有什么局限？\n1. 并非所有关系都是线性的：比如「好」和「坏」的关系可能不是简单的向量加减\n2. 依赖训练数据：如果训练数据有偏见，词向量也会有偏见\n3. 无法处理多义词："苹果"（水果）和"苹果"（公司）的向量会混淆\n\n但这个发现启发了后来的研究：如果我们能用向量运算表示语义关系，那是否能用向量运算进行逻辑推理？这就是知识图谱嵌入和神经符号推理的研究方向。',
    animation: { type: "video", videoPath: "/videos/embedding-analogy.mp4" },
  },
  {
    stepNumber: 8,
    title: "上下文词嵌入 (Contextual Embeddings)",
    formula:
      'e_{\\text{苹果}}^{(i)} = \\text{BERT}(\\text{"我吃了一个苹果"})_i \\neq \\text{BERT}(\\text{"苹果发布了新手机"})_i',
    explanation:
      'Word2Vec 和 GloVe 为每个词分配固定向量（静态嵌入），无法处理一词多义。BERT 等上下文嵌入根据词所在句子生成动态表示："吃苹果"中的苹果 vs "苹果发布会"中的苹果在同一模型中得到不同的向量。这是从 ELMo 到 GPT 系列的核心进步。\n\n【批判性思考】\n上下文嵌入解决了什么问题？\n1. 一词多义："苹果"在不同句子中有不同含义\n2. 词性变化："运行"（动词）和"运行"（名词）有不同含义\n3. 语境依赖："银行"（金融机构）和"银行"（河岸）有不同含义\n\n但上下文嵌入也有代价：\n• 计算量更大：每个词都需要经过 Transformer 编码\n• 存储需求更大：不能简单地用查表获取词向量\n• 推理速度更慢：需要完整的前向传播\n\n这就是为什么静态词向量（如 Word2Vec）在某些场景下仍然有用——它们简单、快速、够用。',
  },
  {
    stepNumber: 9,
    title: "位置编码 (Positional Encoding)",
    formula:
      "\\text{PE}_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right), \\quad \\text{PE}_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right)",
    explanation:
      "自注意力本身不具有位置感知能力——改变输入顺序注意力输出不变。位置编码通过正余弦函数为每个位置添加唯一标记。不同频率的编码使模型能区分位置、捕捉相对距离，且能外推到未见过的序列长度。\n\n【批判性思考】\n为什么用正余弦函数而不是学习位置嵌入？\n1. 外推能力：正余弦函数可以外推到训练时未见过的长度\n2. 相对位置：sin(a+b) = sin(a)cos(b) + cos(a)sin(b)，可以表达相对位置关系\n3. 计算效率：不需要额外的嵌入参数\n\n但也有局限：\n• 最大长度限制：虽然可以外推，但效果会下降\n• 无法建模复杂位置关系：比如「每隔 3 个词」这种模式\n\n现代改进：\n• RoPE（旋转位置编码）：LLaMA 使用，支持更长序列\n• ALiBi：线性偏差注意力，不需要位置编码\n• YaRN：Yet another RoPE extensioN，支持超长序列",
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
      '标准 MLP 无法处理序列数据：输入维度固定，不能处理变长输入，也没有"顺序"概念。"我打你"和"你打我"在 MLP 中会得到相同结果——但语义完全相反。序列模型通过隐藏状态逐步积累序列信息来解决这个问题。',
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
    formula: "x^{(l+1)} = \\text{LayerNorm}\\left(x^{(l)} + \\text{Sublayer}(x^{(l)})\\right)",
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
    formula: "p(x_1, x_2, \\dots, x_n) = \\prod_{t=1}^n p(x_t | x_{<t})",
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
    formula: "L(N, D) = \\frac{A}{N^{\\alpha}} + \\frac{B}{D^{\\beta}} + L_{\\infty}",
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
      '\\text{翻译: } \\text{"英译中: "} \\to \\text{"Transformer 架构..."} \\\\ \\text{问答: } \\text{"问题: ... 答案: "} \\to \\text{"..."} \\\\ \\text{所有任务: } p(y | \\text{指令}, x; \\theta)',
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
    formula: "\\text{LLaMA}(x) = \\text{FFN}(\\text{RMSNorm}(\\text{Attn}(\\text{RMSNorm}(x))))",
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
    formula: "\\text{SwiGLU}(x) = (x \\cdot W_1 \\odot \\sigma(x \\cdot W_2)) \\cdot W_3",
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
      '\\text{系统提示: } \\text{"你是一个有帮助的 AI 助手"} \\\\ \\text{用户消息: } \\text{"请解释 Transformer 架构"} \\\\ \\text{助手回复: } \\text{"Transformer 是一种..."}',
    explanation:
      "有效的 Prompt 通常包含角色定位（系统消息）、任务描述和格式要求。明确的角色分配激活模型中在预训练中对应角色的特定行为模式。系统消息设定整体行为准则，用户消息给出具体任务。",
  },
  {
    stepNumber: 2,
    title: "Zero-shot Prompting",
    formula: "p(y | x_{\\text{任务描述}}, x_{\\text{输入}}; \\theta)",
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
    formula: "p(y | x, \\{(x_i, z_i, y_i)\\}_{i=1}^k; \\theta), \\quad z_i = \\text{中间推理步骤}",
    explanation:
      "CoT 在每个示例中显式写出中间推理步骤 z_i（如 '第一步: ... 第二步: ...'）再给出最终答案。这引导模型进行结构化的逐步推理，而非直接猜测答案。在 GSM8K 数学推理上，CoT 将准确率从 18% 提升至 58%。",
  },
  {
    stepNumber: 5,
    title: "Zero-Shot CoT (Let's Think Step by Step)",
    formula:
      '\\text{标准: } \\text{"Q: {问题} A: "} \\\\ \\text{Zero-shot CoT: } \\text{"Q: {问题} A: Let\'s think step by step."}',
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
    formula: "\\text{节点: 中间推理步骤, 边: 推理分支} \\\\ \\text{方法: BFS/DFS + 自我评价剪枝}",
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
      '\\text{LLM 知识截止: 2023-10} \\\\ \\text{用户提问: "2024 年诺贝尔化学奖获得者是谁？"} \\\\ \\text{无 RAG: LLM 可能编造或说不知道} \\\\ \\text{有 RAG: 检索维基百科 → 准确回答}',
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
      '\\text{文档分块策略} \\\\ \\text{固定大小: } 256 \\text{ tokens, 重叠 20 tokens} \\\\ \\text{语义分块: 按段落/句子边界分割} \\\\ \\text{元数据过滤: 时间 > 2023, 来源 = "academic"',
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
      '\\text{查询重写: } q\' = \\text{LLM}(\\text{"重写查询以更好检索: "} + q) \\\\ \\text{迭代检索: } r_1 \\to \\text{评估} \\to r_2 \\to \\dots \\to \\text{充足} \\to \\text{生成} \\\\ \\text{融合检索 (HyDE): 先假设答案再检索}',
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
      '\\text{LLM 输出: } \\text{<functioncall> search(query="2024 ML papers")} \\\\ \\text{系统调用: } \\text{result = search("2024 ML papers")} \\\\ \\text{返回结果: } \\text{<functionresult> [...]}',
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
      "线性代数是研究「向量」和「矩阵」的数学。听起来很高深？其实你每天都在用。\n\n" +
      "【什么是向量？】\n\n" +
      "想象你去超市买东西，购物清单上写着：苹果 3 个、香蕉 5 根、牛奶 7 盒。把这三个数字排成一排 [3, 5, 7]，这就是一个「向量」。\n\n" +
      "向量的本质就是：用一组数字来描述一件事物。\n\n" +
      "比如描述一个人：年龄 25 岁、身高 170cm、体重 65kg → 向量 [25, 170, 65]\n" +
      "比如描述一张图片的某个像素：红色 200、绿色 100、蓝色 50 → 向量 [200, 100, 50]\n" +
      "比如描述一个词语的含义：「猫」→ 向量 [0.2, -0.5, 0.8, ...]（几百个数字）\n\n" +
      "为什么要用向量？因为计算机处理一组数字特别快。当你问 ChatGPT「猫是什么」的时候，它看到的不是汉字「猫」，而是一串数字。这串数字就是「猫」的向量表示。两个词越像，它们的向量就越接近——「猫」和「狗」的向量会很近，「猫」和「汽车」的向量会很远。\n\n" +
      "【什么是矩阵？】\n\n" +
      "如果向量是一排数字，那矩阵就是把好几排数字叠在一起，变成一个表格。\n\n" +
      "比如一个班级的数学成绩单：\n" +
      "  小明：90 分\n" +
      "  小红：85 分\n" +
      "  小刚：78 分\n\n" +
      "这就是一个 3×1 的矩阵（3 行 1 列）。如果再加上语文和英语成绩，就变成了 3×3 的矩阵：\n" +
      "  小明：数学 90、语文 85、英语 92\n" +
      "  小红：数学 85、语文 90、英语 88\n" +
      "  小刚：数学 78、语文 82、英语 85\n\n" +
      "在 AI 里，矩阵无处不在：\n" +
      "• 一张黑白图片就是一个数字矩阵（每个像素是一个数字，亮度越高数字越大）\n" +
      "• 神经网络的「权重」就是一个大矩阵——它决定了信息怎么流动\n" +
      "• ChatGPT 的每一层都有好几个大矩阵在做计算\n\n" +
      "【矩阵乘法——AI 最核心的运算】\n\n" +
      "矩阵乘法听起来很复杂，但核心思想就是：拿 A 的每一行和 B 的每一列，对应数字相乘再加起来。\n\n" +
      "打个比方：小明有三门课的成绩 [90, 85, 92]，每门课的学分分别是 [3, 4, 2]。\n" +
      "要算加权总分，就是：90×3 + 85×4 + 92×2 = 270 + 340 + 184 = 794。\n\n" +
      "这就是矩阵乘法的本质——批量计算加权和。\n\n" +
      "为什么 AI 离不开它？因为神经网络的每一层本质上就是一次矩阵乘法：\n" +
      "  输出 = 权重矩阵 × 输入向量\n\n" +
      "ChatGPT 之所以能回答问题，就是因为背后有成千上万次这样的矩阵乘法在运转。\n\n" +
      "【转置——把表格翻个身】\n\n" +
      "转置就是把矩阵「横着看变成竖着看」。原来按「人」排列的，现在按「科目」排列。\n\n" +
      "在 AI 里，转置经常用在注意力机制中：计算「谁该关注谁」时，需要把 Key 矩阵转置，这样才能和 Query 相乘。\n\n" +
      "【点积——衡量两个向量有多像】\n\n" +
      "点积就是两个向量「对应位置相乘再全部加起来」。\n\n" +
      "向量 A = [1, 2, 3]，向量 B = [3, 2, 1]\n" +
      "A·B = 1×3 + 2×2 + 3×1 = 10\n\n" +
      "点积越大，说明两个向量越「匹配」。\n\n" +
      "在 AI 里的用途：\n" +
      "• 搜索引擎用点积判断你的搜索词和哪个网页最相关\n" +
      "• 推荐系统用点积判断你可能喜欢哪个商品\n" +
      "• ChatGPT 用点积（注意力机制）判断每个词应该「关注」其他哪些词",
    concepts: [
      {
        id: "vector",
        title: "什么是向量？",
        explanation:
          "向量就是一组数字，用来描述一件事物。\n\n" +
          "想象你去超市买东西，购物清单上写着：苹果 3 个、香蕉 5 根、牛奶 7 盒。把这三个数字排成一排 [3, 5, 7]，这就是一个向量。\n\n" +
          "生活中处处是向量：\n" +
          "• 描述一个人：年龄 25、身高 170、体重 65 → [25, 170, 65]\n" +
          "• 描述一个像素：红 200、绿 100、蓝 50 → [200, 100, 50]\n" +
          "• 描述一个词：「猫」→ [0.2, -0.5, 0.8, ...]（几百个数字）\n\n" +
          "为什么 AI 需要向量？因为计算机只懂数字。当你问 ChatGPT「猫是什么」时，它看到的不是汉字，而是一串数字。两个词越像，它们的向量就越接近——「猫」和「狗」的向量会很近，「猫」和「汽车」的向量会很远。",
        formula: "\\mathbf{v} = \\begin{bmatrix} 3 \\\\ 5 \\\\ 7 \\end{bmatrix}",
        animation: "/videos/vector-shopping-list.mp4",
      },
      {
        id: "matrix",
        title: "什么是矩阵？",
        explanation:
          "如果向量是一排数字，那矩阵就是把好几排数字叠在一起，变成一个表格。\n\n" +
          "比如一个班级的成绩单：\n" +
          "  小明：数学 90、语文 85、英语 92\n" +
          "  小红：数学 85、语文 90、英语 88\n" +
          "  小刚：数学 78、语文 82、英语 85\n\n" +
          "这就是一个 3×3 的矩阵（3 行 3 列）。\n\n" +
          "在 AI 里，矩阵无处不在：\n" +
          "• 一张图片就是一个数字矩阵（每个像素是一个数字）\n" +
          "• 神经网络的权重就是一个大矩阵——它决定信息怎么流动\n" +
          "• ChatGPT 的每一层都有好几个大矩阵在做计算",
        formula:
          "A = \\begin{bmatrix} 90 & 85 & 92 \\\\ 85 & 90 & 88 \\\\ 78 & 82 & 85 \\end{bmatrix}",
        animation: "/videos/matrix-multiplication.mp4",
      },
      {
        id: "matrix-mult",
        title: "矩阵乘法——AI 最核心的运算",
        explanation:
          "矩阵乘法的核心思想：拿 A 的每一行和 B 的每一列，对应数字相乘再加起来。\n\n" +
          "打个比方：\n" +
          "• 小明的成绩 [90, 85, 92]\n" +
          "• 每门课的学分 [3, 4, 2]\n" +
          "• 加权总分 = 90×3 + 85×4 + 92×2 = 794\n\n" +
          "这就是矩阵乘法的本质——批量计算加权和。\n\n" +
          "为什么 AI 离不开它？因为神经网络的每一层本质上就是一次矩阵乘法：\n" +
          "  输出 = 权重矩阵 × 输入向量\n\n" +
          "ChatGPT 之所以能回答问题，就是因为背后有成千上万次这样的矩阵乘法在运转。",
        formula: "C_{ij} = \\sum_{k=1}^m A_{ik} \\cdot B_{kj}",
        animation: "/videos/dot-product-intuition.mp4",
      },
      {
        id: "transpose",
        title: "转置——把表格翻个身",
        explanation:
          "转置就是把矩阵「横着看变成竖着看」。\n\n" +
          "想象一张成绩单：\n" +
          "  原来：小明-数学90、小明-语文85、小明-英语92\n" +
          "  转置后：数学-小明90、数学-小红85、数学-小刚78\n\n" +
          "原来按「人」排列的，现在按「科目」排列了。\n\n" +
          "在 AI 里，转置经常用在注意力机制中：计算「谁该关注谁」时，需要把 Key 矩阵转置，这样才能和 Query 相乘。",
        formula: "A^T = \\begin{bmatrix} 1 & 4 \\\\ 2 & 5 \\\\ 3 & 6 \\end{bmatrix}",
        animation: "/videos/matrix-transform-2d.mp4",
      },
      {
        id: "dot-product",
        title: "点积——衡量两个向量有多像",
        explanation:
          "点积就是两个向量「对应位置相乘再全部加起来」。\n\n" +
          "例子：\n" +
          "• 向量 A = [1, 2, 3]（小明：语文1分、数学2分、英语3分）\n" +
          "• 向量 B = [3, 2, 1]（权重：语文3分、数学2分、英语1分）\n" +
          "• A·B = 1×3 + 2×2 + 3×1 = 10\n\n" +
          "点积越大，说明两个向量越「匹配」。\n\n" +
          "在 AI 里的用途：\n" +
          "• 搜索引擎用点积判断搜索词和哪个网页最相关\n" +
          "• 推荐系统用点积判断你可能喜欢哪个商品\n" +
          "• ChatGPT 用点积（注意力机制）判断每个词应该「关注」其他哪些词",
        formula: "\\mathbf{a} \\cdot \\mathbf{b} = a_1 b_1 + a_2 b_2 + \\dots + a_n b_n",
        animation: "/videos/dot-product-intuition.mp4",
      },
    ],
    quizzes: [
      {
        id: "q1_1_1",
        question: "向量是什么？",
        options: ["一个数字", "一组数字", "一个表格", "一个函数"],
        correctIndex: 1,
        explanation: "向量就是一组数字，用来描述一件事物。比如 [3, 5, 7] 就是一个向量。",
      },
      {
        id: "q1_1_2",
        question: "矩阵和向量有什么区别？",
        options: [
          "矩阵是向量的另一种说法",
          "矩阵是把多排数字叠在一起，变成一个表格",
          "矩阵只能是 2×2 的",
          "矩阵不能做运算",
        ],
        correctIndex: 1,
        explanation: "如果向量是一排数字，那矩阵就是把好几排数字叠在一起，变成一个表格。",
      },
      {
        id: "q1_1_3",
        question: "点积的作用是什么？",
        options: ["计算两个向量的和", "衡量两个向量有多像", "把矩阵变大", "存储数据"],
        correctIndex: 1,
        explanation: "点积越大，说明两个向量越「匹配」。搜索引擎用点积判断搜索词和哪个网页最相关。",
      },
    ],
    backLink: { chapterId: "ch1", chapterTitle: "数学基础" },
  },
  ch1_lesson2: {
    derivationSteps: calculusDerivationSteps,
    bodyText:
      "微积分研究的是「变化」和「累积」。听起来很抽象？我们用一个例子来理解。\n\n" +
      "【导数——变化的速度】\n\n" +
      "想象你在开车。你的仪表盘上有一个速度计，显示你当前的速度。\n" +
      "• 如果速度是 60 km/h，说明你的位置每小时变化 60 公里\n" +
      "• 如果速度是 0 km/h，说明你的位置没在变\n\n" +
      "速度就是位置对时间的「导数」——它告诉你位置变化得有多快。\n\n" +
      "再举个例子：你往杯子里倒水。水位高度 h 随时间 t 变化。\n" +
      "• 如果倒得快，水位上升得快，导数大\n" +
      "• 如果倒得慢，水位上升得慢，导数小\n" +
      "• 如果水满了溢出来，水位不再上升，导数为零\n\n" +
      "导数的数学定义：f'(x) = lim(h→0) [f(x+h) - f(x)] / h\n" +
      "翻译成人话：「当 x 变化一个极小的量时，f(x) 变化了多少？」\n\n" +
      "【梯度——往哪个方向走最好】\n\n" +
      "如果函数只有一个变量，导数就是一个数字（往左走还是往右走）。\n" +
      "但如果函数有多个变量（比如 f(x, y)），就需要用「梯度」——它是一个向量，告诉你每个方向的变化速度。\n\n" +
      "打个比方：你在山上，蒙着眼睛想下山。你怎么知道往哪个方向走？\n" +
      "• 梯度告诉你：哪个方向最陡\n" +
      "• 往梯度的反方向走（下山方向），你就能最快到达山脚\n\n" +
      "这就是「梯度下降」的核心思想：沿梯度反方向走，一步步逼近最低点。\n\n" +
      "【链式法则——多步变化怎么算】\n\n" +
      "假设你要计算「考试成绩对学习时间的导数」，但成绩和学习时间之间隔了好几步：\n" +
      "  学习时间 → 做题数量 → 做题正确率 → 最终成绩\n\n" +
      "链式法则说：把这些步骤的导数乘起来就行。\n" +
      "  成绩对学习时间的导数 = 成绩对正确率的导数 × 正确率对做题量的导数 × 做题量对学习时间的导数\n\n" +
      "这个「乘起来」的操作，就是深度学习中「反向传播」的数学基础。\n\n" +
      "【梯度下降——一步步逼近最优解】\n\n" +
      "假设你有一个模型，它的预测不太准。你希望调整参数让预测更准。\n\n" +
      "步骤：\n" +
      "1. 算出当前参数下的误差（损失函数的值）\n" +
      "2. 算出误差对每个参数的梯度（哪个参数需要调大、哪个需要调小）\n" +
      "3. 沿梯度反方向更新参数（误差变小的方向）\n" +
      "4. 重复，直到误差足够小\n\n" +
      "这就像蒙着眼睛下山：每一步都往最陡的下坡方向走，最终到达山脚（最优解）。\n\n" +
      "学习率（步长）决定了每一步走多远：\n" +
      "• 太大：可能走过头，来回震荡，到不了最低点\n" +
      "• 太小：走得太慢，训练要花很长时间\n\n" +
      "ChatGPT 就是通过几十亿次这样的「计算梯度 → 更新参数」循环训练出来的。",
    concepts: [
      {
        id: "derivative",
        title: "导数 = 变化的速度",
        explanation:
          "想象你在开车。仪表盘上的速度计显示你当前的速度。\n\n" +
          "• 速度 60 km/h → 位置每小时变化 60 公里\n" +
          "• 速度 0 km/h → 位置没在变\n\n" +
          "速度就是位置对时间的「导数」——它告诉你变化得有多快。\n\n" +
          "再举个例子：往杯子里倒水。\n" +
          "• 倒得快 → 水位上升快 → 导数大\n" +
          "• 倒得慢 → 水位上升慢 → 导数小\n" +
          "• 水满了 → 水位不再上升 → 导数为零\n\n" +
          "导数的数学定义：f'(x) = lim(h→0) [f(x+h) - f(x)] / h\n" +
          "翻译成人话：「当 x 变化一个极小的量时，f(x) 变化了多少？」",
        formula: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        animation: "/videos/derivative-as-slope.mp4",
      },
      {
        id: "gradient",
        title: "梯度 = 往哪个方向走最好",
        explanation:
          "如果函数只有一个变量，导数就是一个数字（往左走还是往右走）。\n\n" +
          "但如果函数有多个变量（比如 f(x, y)），就需要用「梯度」——它是一个向量，告诉你每个方向的变化速度。\n\n" +
          "打个比方：你在山上，蒙着眼睛想下山。怎么知道往哪个方向走？\n" +
          "• 梯度告诉你：哪个方向最陡\n" +
          "• 往梯度的反方向走（下山方向），你就能最快到达山脚\n\n" +
          "这就是「梯度下降」的核心思想：沿梯度反方向走，一步步逼近最低点。",
        formula:
          "\\nabla f = \\begin{bmatrix} \\frac{\\partial f}{\\partial x} \\\\ \\frac{\\partial f}{\\partial y} \\end{bmatrix}",
        animation: "/videos/gradient-descent-intuition.mp4",
      },
      {
        id: "chain-rule",
        title: "链式法则 = 多步变化怎么算",
        explanation:
          "假设你要计算「考试成绩对学习时间的导数」，但中间隔了好几步：\n\n" +
          "  学习时间 → 做题数量 → 做题正确率 → 最终成绩\n\n" +
          "链式法则说：把这些步骤的导数乘起来就行。\n\n" +
          "  成绩对学习时间的导数\n" +
          "  = 成绩对正确率的导数\n" +
          "  × 正确率对做题量的导数\n" +
          "  × 做题量对学习时间的导数\n\n" +
          "这个「乘起来」的操作，就是深度学习中「反向传播」的数学基础。",
        formula:
          "\\frac{dy}{dx} = \\frac{dy}{dh} \\cdot \\frac{dh}{dg} \\cdot \\frac{dg}{df} \\cdot \\frac{df}{dx}",
        animation: "/videos/chain-rule-flow.mp4",
      },
      {
        id: "gradient-descent",
        title: "梯度下降 = 蒙着眼睛下山",
        explanation:
          "假设你有一个模型，预测不太准。怎么调整参数让预测更准？\n\n" +
          "步骤：\n" +
          "1. 算出当前参数下的误差（损失函数的值）\n" +
          "2. 算出误差对每个参数的梯度（哪个参数需要调大、哪个需要调小）\n" +
          "3. 沿梯度反方向更新参数（误差变小的方向）\n" +
          "4. 重复，直到误差足够小\n\n" +
          "这就像蒙着眼睛下山：每一步都往最陡的下坡方向走，最终到达山脚（最优解）。\n\n" +
          "学习率（步长）决定了每一步走多远：\n" +
          "• 太大：可能走过头，来回震荡，到不了最低点\n" +
          "• 太小：走得太慢，训练要花很长时间\n\n" +
          "ChatGPT 就是通过几十亿次这样的「计算梯度 → 更新参数」循环训练出来的。",
        formula: "\\theta_{t+1} = \\theta_t - \\eta \\cdot \\nabla L(\\theta_t)",
        animation: "/videos/gradient-descent-intuition.mp4",
      },
    ],
    quizzes: [
      {
        id: "q1_2_1",
        question: "导数是什么？",
        options: ["两个数的和", "变化的速度", "一个表格", "存储空间"],
        correctIndex: 1,
        explanation: "导数就是函数在某个点的「瞬时变化率」，就像速度计显示你此刻的速度一样。",
      },
      {
        id: "q1_2_2",
        question: "梯度下降就像什么？",
        options: ["爬山", "蒙眼下山", "游泳", "跑步"],
        correctIndex: 1,
        explanation:
          "梯度下降就像蒙着眼睛下山：每一步都往最陡的下坡方向走，最终到达山脚（最优解）。",
      },
      {
        id: "q1_2_3",
        question: "链式法则的作用是什么？",
        options: ["计算两个数的乘积", "计算多步变化的导数", "存储数据", "显示图片"],
        correctIndex: 1,
        explanation: "链式法则告诉我们如何计算复合函数的导数：把这些步骤的导数乘起来就行。",
      },
    ],
    backLink: { chapterId: "ch1", chapterTitle: "数学基础" },
  },
  ch2_lesson1: {
    derivationSteps: nnBasicDerivationSteps,
    bodyText:
      "神经网络是什么？简单说：一堆数学函数叠在一起，从数据中学习规律。\n\n" +
      "【从感知器说起】\n\n" +
      "1958 年，科学家 Frank Rosenblatt 发明了「感知器」——一个超简单的决策机器。\n\n" +
      "感知器的工作方式：\n" +
      "• 接收几个输入（比如今天温度、湿度、风速）\n" +
      "• 每个输入乘以一个权重（重要程度）\n" +
      "• 全部加起来\n" +
      "• 如果总和超过某个阈值，输出 1（比如「明天会下雨」）；否则输出 0\n\n" +
      "这就像你做决定：综合考虑多个因素，加权打分，超过阈值就行动。\n\n" +
      "但感知器有个致命问题：它只能处理「线性可分」的问题——也就是能用一条直线分开的问题。\n" +
      "比如「 AND 门」（两个输入都是 1 才输出 1）可以，但「异或门」（一个输入是 1 另一个是 0 才输出 1）不行。\n\n" +
      "【激活函数——引入非线性】\n\n" +
      "怎么解决感知器的局限？在加权求和之后，加一个「激活函数」。\n\n" +
      "激活函数的作用：把线性计算变成非线性计算。\n\n" +
      "最常见的激活函数：\n" +
      "• Sigmoid：把任何数字压缩到 0 到 1 之间。像一个 S 形曲线。\n" +
      "• ReLU：如果输入大于 0 就原样输出，小于 0 就输出 0。简单粗暴但有效。\n" +
      "• GELU：ReLU 的平滑版本，ChatGPT 用的就是这个。\n\n" +
      "有了激活函数，多层感知器就能逼近任意复杂函数——这就是「通用近似定理」。\n\n" +
      "【多层堆叠——深度学习的起源】\n\n" +
      "把多个感知器叠在一起，就变成了「神经网络」：\n" +
      "• 第一层（输入层）：接收原始数据\n" +
      "• 中间层（隐藏层）：逐层提取特征\n" +
      "• 最后一层（输出层）：给出最终答案\n\n" +
      "每一层都有自己的权重矩阵和激活函数。层数越多，网络越「深」，能学习的模式就越复杂。\n\n" +
      "比如识别一只猫：\n" +
      "• 第一层可能学习识别边缘（横线、竖线、斜线）\n" +
      "• 第二层可能学习识别形状（圆形、三角形）\n" +
      "• 第三层可能学习识别部件（耳朵、眼睛、鼻子）\n" +
      "• 最后一层综合判断：这是猫还是狗\n\n" +
      "【权重和偏置——网络学习的参数】\n\n" +
      "神经网络「学习」的过程，就是不断调整权重和偏置的过程。\n\n" +
      "• 权重：决定每个输入有多重要。比如预测房价时，「面积」的权重可能比「颜色」大得多。\n" +
      "• 偏置：即使所有输入都是 0，网络也需要一个基础输出。偏置就是这个「起跑线」。\n\n" +
      "一开始，权重和偏置是随机的（网络什么都不会）。通过不断训练（用数据调参数），网络逐渐学会正确的权重组合。\n\n" +
      "ChatGPT 有 1750 亿个参数（权重）。它在训练时读了互联网上几乎所有文字，不断调整这些参数，直到能像人一样说话。",
    concepts: [
      {
        id: "perceptron",
        title: "感知器——最简单的决策机器",
        explanation:
          "1958 年，科学家 Rosenblatt 发明了「感知器」。\n\n" +
          "工作方式：\n" +
          "• 接收几个输入（比如温度、湿度、风速）\n" +
          "• 每个输入乘以一个权重（重要程度）\n" +
          "• 全部加起来\n" +
          "• 如果总和超过某个阈值，输出 1；否则输出 0\n\n" +
          "这就像你做决定：综合考虑多个因素，加权打分，超过阈值就行动。\n\n" +
          "但感知器有个致命问题：它只能处理「线性可分」的问题。比如「异或门」就处理不了。",
        formula: "y = \\phi\\left(\\sum_{i=1}^n w_i x_i + b\\right)",
        animation: "/videos/nn-forward-pass.mp4",
      },
      {
        id: "activation",
        title: "激活函数——引入非线性",
        explanation:
          "怎么解决感知器的局限？在加权求和之后，加一个「激活函数」。\n\n" +
          "激活函数的作用：把线性计算变成非线性计算。\n\n" +
          "最常见的激活函数：\n" +
          "• Sigmoid：把任何数字压缩到 0 到 1 之间。像一个 S 形曲线。\n" +
          "• ReLU：如果输入大于 0 就原样输出，小于 0 就输出 0。简单粗暴但有效。\n" +
          "• GELU：ReLU 的平滑版本，ChatGPT 用的就是这个。\n\n" +
          "有了激活函数，多层感知器就能逼近任意复杂函数——这就是「通用近似定理」。",
        formula: "\\text{ReLU}(x) = \\max(0, x)",
        animation: "/videos/activation-functions.mp4",
      },
      {
        id: "network-layers",
        title: "多层堆叠——深度学习的起源",
        explanation:
          "把多个感知器叠在一起，就变成了「神经网络」：\n\n" +
          "• 第一层（输入层）：接收原始数据\n" +
          "• 中间层（隐藏层）：逐层提取特征\n" +
          "• 最后一层（输出层）：给出最终答案\n\n" +
          "每一层都有自己的权重矩阵和激活函数。层数越多，网络越「深」，能学习的模式就越复杂。\n\n" +
          "比如识别一只猫：\n" +
          "• 第一层可能学习识别边缘（横线、竖线、斜线）\n" +
          "• 第二层可能学习识别形状（圆形、三角形）\n" +
          "• 第三层可能学习识别部件（耳朵、眼睛、鼻子）\n" +
          "• 最后一层综合判断：这是猫还是狗",
        animation: "/videos/nn-forward-pass.mp4",
      },
      {
        id: "weights-bias",
        title: "权重和偏置——网络学习的参数",
        explanation:
          "神经网络「学习」的过程，就是不断调整权重和偏置的过程。\n\n" +
          "• 权重：决定每个输入有多重要。比如预测房价时，「面积」的权重可能比「颜色」大得多。\n" +
          "• 偏置：即使所有输入都是 0，网络也需要一个基础输出。偏置就是这个「起跑线」。\n\n" +
          "一开始，权重和偏置是随机的（网络什么都不会）。通过不断训练（用数据调参数），网络逐渐学会正确的权重组合。\n\n" +
          "ChatGPT 有 1750 亿个参数（权重）。它在训练时读了互联网上几乎所有文字，不断调整这些参数，直到能像人一样说话。",
        formula: "y = W \\cdot x + b",
        animation: "/videos/nn-forward-pass.mp4",
      },
    ],
    quizzes: [
      {
        id: "q2_1_1",
        question: "感知器是什么？",
        options: ["一种存储设备", "一个超简单的决策机器", "一种编程语言", "一个数据库"],
        correctIndex: 1,
        explanation: "感知器是神经网络的基本单元，它接收输入、加权求和、然后做出决策。",
      },
      {
        id: "q2_1_2",
        question: "激活函数的作用是什么？",
        options: ["存储数据", "把线性计算变成非线性计算", "显示图片", "计算速度"],
        correctIndex: 1,
        explanation: "激活函数引入非线性，让神经网络能学习复杂的模式。",
      },
      {
        id: "q2_1_3",
        question: "神经网络「学习」的过程是什么？",
        options: ["读取更多数据", "不断调整权重和偏置", "增加更多层", "删除旧数据"],
        correctIndex: 1,
        explanation: "神经网络通过不断调整权重和偏置来学习，直到能做出正确的预测。",
      },
    ],
    backLink: { chapterId: "ch2", chapterTitle: "深度学习基础" },
  },
  ch2_lesson2: {
    derivationSteps: backpropDerivationSteps,
    bodyText:
      "反向传播是深度学习的核心算法。没有它，神经网络就没法训练。\n\n" +
      "【问题：怎么知道每个参数该调多少？】\n\n" +
      "假设你有一个神经网络，预测「明天会不会下雨」。\n" +
      "• 网络的输入：温度、湿度、风速等\n" +
      "• 网络的输出：下雨的概率（比如 0.7，即 70% 会下雨）\n" +
      "• 实际结果：明天下雨了（应该是 100%）\n\n" +
      "误差 = 1 - 0.7 = 0.3\n\n" +
      "问题是：网络有几百万甚至几十亿个参数。这个 0.3 的误差，应该分配给哪些参数？每个参数该调多少？\n\n" +
      "如果一个一个试，要试到天荒地老。反向传播给出了一种高效的方法。\n\n" +
      "【链式法则——反向传播的数学基础】\n\n" +
      "回忆一下链式法则：如果 A 影响 B，B 影响 C，那么 A 对 C 的影响 = A 对 B 的影响 × B 对 C 的影响。\n\n" +
      "在神经网络里：\n" +
      "  输入 → 第1层 → 第2层 → ... → 第N层 → 输出 → 损失\n\n" +
      "反向传播从损失开始，沿着网络反向走回去，一层一层计算每个参数的「贡献度」（梯度）。\n\n" +
      "【具体步骤】\n\n" +
      "第一步：前向传播——把输入喂给网络，算出预测值和损失。\n" +
      "第二步：从损失开始，计算损失对输出层的梯度。\n" +
      "第三步：利用链式法则，把梯度一层一层往回传。\n" +
      "第四步：每一层算出自己参数的梯度。\n" +
      "第五步：用梯度更新参数（梯度下降）。\n\n" +
      "【为什么叫「反向」？】\n\n" +
      "因为计算梯度的方向和数据流动的方向相反：\n" +
      "• 数据流动：输入 → 输出（前向）\n" +
      "• 梯度流动：损失 → 输入（反向）\n\n" +
      "【一个具体的例子】\n\n" +
      "假设一个超简单的网络：y = w × x + b\n" +
      "• x = 2（输入）\n" +
      "• w = 0.5（权重，一开始是随机的）\n" +
      "• b = 0.1（偏置）\n" +
      "• 预测 y = 0.5 × 2 + 0.1 = 1.1\n" +
      "• 实际值 y_true = 2.0\n" +
      "• 损失 L = (y - y_true)² = (1.1 - 2.0)² = 0.81\n\n" +
      "现在要更新 w 和 b：\n" +
      "• 损失对 w 的梯度：dL/dw = 2(y - y_true) × x = 2 × (-0.9) × 2 = -3.6\n" +
      "• 损失对 b 的梯度：dL/db = 2(y - y_true) = -1.8\n\n" +
      "梯度是负的，说明 w 和 b 都需要调大（沿负梯度方向更新）。\n\n" +
      "用学习率 0.1 更新：\n" +
      "• w_new = 0.5 - 0.1 × (-3.6) = 0.86\n" +
      "• b_new = 0.1 - 0.1 × (-1.8) = 0.28\n\n" +
      "更新后的预测：0.86 × 2 + 0.28 = 2.0，和实际值一样了！\n\n" +
      "这就是反向传播 + 梯度下降的完整过程。在实际的 ChatGPT 中，这个过程要重复几十亿次。",
    concepts: [
      {
        id: "backprop-problem",
        title: "问题：怎么知道每个参数该调多少？",
        explanation:
          "假设你有一个神经网络，预测「明天会不会下雨」。\n\n" +
          "• 网络的输入：温度、湿度、风速等\n" +
          "• 网络的输出：下雨的概率（比如 0.7，即 70% 会下雨）\n" +
          "• 实际结果：明天下雨了（应该是 100%）\n\n" +
          "误差 = 1 - 0.7 = 0.3\n\n" +
          "问题是：网络有几百万甚至几十亿个参数。这个 0.3 的误差，应该分配给哪些参数？每个参数该调多少？\n\n" +
          "如果一个一个试，要试到天荒地老。反向传播给出了一种高效的方法。",
        animation: "/videos/gradient-backpropagation.mp4",
      },
      {
        id: "backprop-chain",
        title: "链式法则——反向传播的数学基础",
        explanation:
          "回忆一下链式法则：如果 A 影响 B，B 影响 C，那么 A 对 C 的影响 = A 对 B 的影响 × B 对 C 的影响。\n\n" +
          "在神经网络里：\n" +
          "  输入 → 第1层 → 第2层 → ... → 第N层 → 输出 → 损失\n\n" +
          "反向传播从损失开始，沿着网络反向走回去，一层一层计算每个参数的「贡献度」（梯度）。",
        formula:
          "\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial a} \\cdot \\frac{\\partial a}{\\partial h} \\cdot \\frac{\\partial h}{\\partial w}",
        animation: "/videos/gradient-backpropagation.mp4",
      },
      {
        id: "backprop-steps",
        title: "具体步骤：前向 → 反向 → 更新",
        explanation:
          "第一步：前向传播——把输入喂给网络，算出预测值和损失。\n\n" +
          "第二步：从损失开始，计算损失对输出层的梯度。\n\n" +
          "第三步：利用链式法则，把梯度一层一层往回传。\n\n" +
          "第四步：每一层算出自己参数的梯度。\n\n" +
          "第五步：用梯度更新参数（梯度下降）。\n\n" +
          "为什么叫「反向」？因为计算梯度的方向和数据流动的方向相反：\n" +
          "• 数据流动：输入 → 输出（前向）\n" +
          "• 梯度流动：损失 → 输入（反向）",
        animation: "/videos/gradient-backpropagation.mp4",
      },
      {
        id: "backprop-example",
        title: "一个具体的例子",
        explanation:
          "假设一个超简单的网络：y = w × x + b\n\n" +
          "• x = 2（输入）\n" +
          "• w = 0.5（权重，一开始是随机的）\n" +
          "• b = 0.1（偏置）\n" +
          "• 预测 y = 0.5 × 2 + 0.1 = 1.1\n" +
          "• 实际值 y_true = 2.0\n" +
          "• 损失 L = (y - y_true)² = (1.1 - 2.0)² = 0.81\n\n" +
          "现在要更新 w 和 b：\n" +
          "• 损失对 w 的梯度：dL/dw = 2(y - y_true) × x = 2 × (-0.9) × 2 = -3.6\n" +
          "• 损失对 b 的梯度：dL/db = 2(y - y_true) = -1.8\n\n" +
          "梯度是负的，说明 w 和 b 都需要调大（沿负梯度方向更新）。\n\n" +
          "用学习率 0.1 更新：\n" +
          "• w_new = 0.5 - 0.1 × (-3.6) = 0.86\n" +
          "• b_new = 0.1 - 0.1 × (-1.8) = 0.28\n\n" +
          "更新后的预测：0.86 × 2 + 0.28 = 2.0，和实际值一样了！",
        formula: "w_{new} = w - \\eta \\cdot \\frac{\\partial L}{\\partial w}",
        animation: "/videos/gradient-backpropagation.mp4",
      },
    ],
    quizzes: [
      {
        id: "q2_2_1",
        question: "反向传播的作用是什么？",
        options: ["存储数据", "计算每个参数的梯度", "显示图片", "加速计算"],
        correctIndex: 1,
        explanation: "反向传播从输出层向输入层传播梯度，计算每个参数对误差的贡献。",
      },
      {
        id: "q2_2_2",
        question: "梯度消失是什么问题？",
        options: ["梯度变得太大", "梯度在深层网络中变得极小", "梯度计算太慢", "梯度方向错误"],
        correctIndex: 1,
        explanation:
          "梯度消失是指在深层网络中，梯度经过多次连乘后变得极小，导致浅层参数几乎无法更新。",
      },
      {
        id: "q2_2_3",
        question: "Adam 优化器的优点是什么？",
        options: ["计算最简单", "为每个参数自适应调整学习率", "不需要梯度", "只用一次迭代"],
        correctIndex: 1,
        explanation: "Adam 为每个参数独立调整学习率，是目前最广泛使用的优化器。",
      },
    ],
    backLink: { chapterId: "ch2", chapterTitle: "深度学习基础" },
  },
  ch3_lesson1: {
    derivationSteps: wordEmbeddingDerivationSteps,
    bodyText:
      "计算机怎么理解文字？它不认识汉字，只懂数字。所以必须先把文字转换成数字。\n\n" +
      "【最简单的方法：One-Hot 编码】\n\n" +
      "假设我们只有 5 个词：猫、狗、鱼、鸟、虫。\n\n" +
      "One-Hot 编码就是：给每个词分配一个位置，这个词对应位置是 1，其他都是 0。\n" +
      "• 猫 → [1, 0, 0, 0, 0]\n" +
      "• 狗 → [0, 1, 0, 0, 0]\n" +
      "• 鱼 → [0, 0, 1, 0, 0]\n\n" +
      "问题来了：\n" +
      "• 每个词的向量都很长（词表有多大，向量就多长）\n" +
      "• 所有词之间的距离都一样（「猫」和「狗」的距离 = 「猫」和「鱼」的距离）\n" +
      "• 没有语义信息（「猫」和「狗」应该比「猫」和「鱼」更像）\n\n" +
      "【Word2Vec——让相似的词靠近】\n\n" +
      "2013 年，Google 的 Tomas Mikolov 提出了 Word2Vec。核心思想很简单：\n\n" +
      "「一个词的含义，由它周围的词决定。」\n\n" +
      "比如这两句话：\n" +
      "• 「我养了一只___，它很可爱」\n" +
      "• 「我养了一只___，它会汪汪叫」\n\n" +
      "第一个空可能是「猫」或「狗」，第二个空几乎肯定是「狗」。\n\n" +
      "Word2Vec 训练一个简单的神经网络：给定一个词，预测它周围的词（Skip-Gram），或者给定周围的词，预测中间的词（CBOW）。\n\n" +
      "训练完成后，每个词都有一个「有意义」的向量：\n" +
      "• 「猫」和「狗」的向量很近（因为它们经常出现在相似的上下文中）\n" +
      "• 「猫」和「汽车」的向量很远（因为它们几乎不会出现在相似的上下文中）\n\n" +
      "【神奇的类比推理】\n\n" +
      "最著名的结果：\n" +
      "  国王 - 男人 + 女人 ≈ 王后\n\n" +
      "这说明向量空间里捕捉到了「性别」这个语义维度。\n\n" +
      "类似地：\n" +
      "  北京 - 中国 + 日本 ≈ 东京\n" +
      "  走 - 走路 + 开 ≈ 开车\n\n" +
      "【GloVe——全局统计】\n\n" +
      "Word2Vec 只看局部上下文。GloVe（2014）则统计整个语料库中词与词共同出现的次数，然后用矩阵分解的方法生成词向量。\n\n" +
      "【现代方法：上下文嵌入】\n\n" +
      "Word2Vec 和 GloVe 生成的是「静态」词向量——「猫」不管在什么句子里都是同一个向量。\n\n" +
      "但现实中，同一个词在不同语境下含义不同：\n" +
      "• 「他在银行存钱」vs「河的银行很陡」\n" +
      "• 前一个「银行」是金融机构，后一个是河岸\n\n" +
      "BERT 和 GPT 使用「上下文嵌入」：同一个词在不同句子里有不同的向量。这更接近人类理解语言的方式。\n\n" +
      "【嵌入在现代 AI 中的角色】\n\n" +
      "虽然具体的嵌入方法在进化，但核心思想没变：\n" +
      "把离散的符号（文字、图片、声音）转换成连续的向量，让神经网络能够处理。\n\n" +
      "ChatGPT 的第一步就是把你的输入转换成向量（token embedding），然后才能进行后续的注意力计算。",
    concepts: [
      {
        id: "one-hot",
        title: "One-Hot 编码——最简单的表示",
        explanation:
          "计算机不认识汉字，只懂数字。最简单的方法：给每个词分配一个位置。\n\n" +
          "假设只有 5 个词：猫、狗、鱼、鸟、虫。\n" +
          "• 猫 → [1, 0, 0, 0, 0]\n" +
          "• 狗 → [0, 1, 0, 0, 0]\n" +
          "• 鱼 → [0, 0, 1, 0, 0]\n\n" +
          "问题：\n" +
          "• 向量很长（词表有多大，向量就多长）\n" +
          "• 所有词之间的距离都一样\n" +
          "• 没有语义信息（「猫」和「狗」应该比「猫」和「鱼」更像）",
        animation: "/videos/embedding-space.mp4",
      },
      {
        id: "word2vec",
        title: "Word2Vec——让相似的词靠近",
        explanation:
          "2013 年，Google 提出了 Word2Vec。核心思想：\n\n" +
          "「一个词的含义，由它周围的词决定。」\n\n" +
          "比如：\n" +
          "• 「我养了一只___，它很可爱」→ 可能是「猫」或「狗」\n" +
          "• 「我养了一只___，它会汪汪叫」→ 几乎肯定是「狗」\n\n" +
          "Word2Vec 训练一个简单的神经网络：给定一个词，预测它周围的词。\n\n" +
          "训练完成后：\n" +
          "• 「猫」和「狗」的向量很近（经常出现在相似上下文）\n" +
          "• 「猫」和「汽车」的向量很远",
        animation: "/videos/embedding-space.mp4",
      },
      {
        id: "analogy",
        title: "神奇的类比推理",
        explanation:
          "词向量空间展现惊人的线性结构：\n\n" +
          "  国王 - 男人 + 女人 ≈ 王后\n\n" +
          "这说明向量空间里捕捉到了「性别」这个语义维度。\n\n" +
          "类似地：\n" +
          "  北京 - 中国 + 日本 ≈ 东京\n" +
          "  走 - 走路 + 开 ≈ 开车\n\n" +
          "语义关系通过向量加减表示，这是词嵌入最神奇的地方。",
        animation: "/videos/embedding-analogy.mp4",
      },
      {
        id: "contextual",
        title: "上下文嵌入——同一个词不同含义",
        explanation:
          "Word2Vec 生成的是「静态」词向量——「猫」不管在什么句子里都是同一个向量。\n\n" +
          "但现实中，同一个词在不同语境下含义不同：\n" +
          "• 「他在银行存钱」→ 金融机构\n" +
          "• 「河的银行很陡」→ 河岸\n\n" +
          "BERT 和 GPT 使用「上下文嵌入」：同一个词在不同句子里有不同的向量。这更接近人类理解语言的方式。",
        animation: "/videos/embedding-space.mp4",
      },
    ],
    backLink: { chapterId: "ch3", chapterTitle: "NLP基础" },
  },
  ch3_lesson2: {
    derivationSteps: sequenceModelDerivationSteps,
    bodyText:
      "语言是有顺序的。「我爱你」和「你爱我」意思完全不同。怎么让 AI 理解顺序？\n\n" +
      "【RNN——有记忆的神经网络】\n\n" +
      "普通神经网络处理的是固定长度的输入。但句子有长有短，一个词一个词地输入怎么办？\n\n" +
      "RNN（循环神经网络）的思路：\n" +
      "• 每读一个词，更新一次「记忆」\n" +
      "• 这个记忆叫「隐藏状态」（hidden state）\n" +
      "• 下一个词的处理会考虑之前的所有记忆\n\n" +
      "打个比方：你在读一本书。\n" +
      "• 读完第 1 章，你脑子里有了第 1 章的印象\n" +
      "• 读第 2 章时，你会联系第 1 章的内容来理解\n" +
      "• 读第 3 章时，你同时记得前两章的内容\n\n" +
      "RNN 就是这样工作的：每个时间步都接收新输入 + 上一步的记忆，输出新记忆。\n\n" +
      "【RNN 的致命问题：梯度消失】\n\n" +
      "RNN 的训练用的是「时间反向传播」（BPTT）——把网络沿时间步展开，然后用反向传播。\n\n" +
      "问题是：如果序列很长（比如一篇 1000 字的文章），梯度要从最后一步传回第一步。每传一步，梯度都会乘以一个小于 1 的数。传了很多步之后，梯度就几乎变成 0 了。\n\n" +
      "这意味着：网络很难学到「长期依赖」——比如文章开头提到的主角名字，到结尾时网络可能已经忘了。\n\n" +
      "【LSTM——学会选择性遗忘】\n\n" +
      "1997 年，Hochreiter 和 Schmidhuber 提出了 LSTM（长短期记忆网络），专门解决梯度消失问题。\n\n" +
      "LSTM 的核心创新：引入了「细胞状态」（cell state）——一条信息高速公路。\n\n" +
      "LSTM 有三个「门」来控制信息流动：\n" +
      "1. 遗忘门：决定丢弃哪些旧信息（比如读到新段落时，忘记上一段的细节）\n" +
      "2. 输入门：决定存储哪些新信息（比如遇到重要数据时，写入记忆）\n" +
      "3. 输出门：决定输出哪些信息（比如回答问题时，只输出相关部分）\n\n" +
      "打个比方：你在考试前复习。\n" +
      "• 遗忘门：忘掉不重要的细节（比如课本的页码）\n" +
      "• 输入门：记住重要的公式和概念\n" +
      "• 输出门：考试时只回忆和题目相关的知识\n\n" +
      "因为细胞状态可以几乎无损地传递信息（梯度消失问题大大缓解），LSTM 能学到比 RNN 更长的依赖关系。\n\n" +
      "【GRU——LSTM 的简化版】\n\n" +
      "2014 年，Cho 等人提出了 GRU（门控循环单元）。它是 LSTM 的简化：\n" +
      "• 把遗忘门和输入门合并成一个「更新门」\n" +
      "• 去掉了细胞状态，直接在隐藏状态上操作\n" +
      "• 参数更少，训练更快，效果差不多\n\n" +
      "【Seq2Seq——从编码到解码】\n\n" +
      "2014 年，Sutskever 等人提出了 Seq2Seq（序列到序列）架构：\n" +
      "• 编码器（Encoder）：读完整个输入序列，压缩成一个固定长度的向量\n" +
      "• 解码器（Decoder）：从这个向量开始，一个词一个词地生成输出\n\n" +
      "这就是机器翻译的基础架构：编码器读完中文，解码器生成英文。\n\n" +
      "但 Seq2Seq 有个问题：不管输入多长，都压缩成一个固定长度的向量。长句子的信息会丢失。\n\n" +
      "解决方案就是「注意力机制」——让解码器在生成每个词时，能「回头看」编码器的所有位置，选择性地关注最相关的部分。这就是 Transformer 的前身。\n\n" +
      "【为什么现在很少用 RNN？】\n\n" +
      "Transformer 用自注意力替代了循环结构，好处是：\n" +
      "• 可以并行计算（RNN 必须按顺序处理）\n" +
      "• 能直接捕捉长距离依赖（不需要一步步传递）\n" +
      "• 训练速度更快\n\n" +
      "但 RNN 的思想并没有完全消失。门控机制、残差连接等设计思想仍然在 Transformer 中使用。",
    concepts: [
      {
        id: "rnn",
        title: "RNN——有记忆的神经网络",
        explanation:
          "普通神经网络处理的是固定长度的输入。但句子有长有短，一个词一个词地输入怎么办？\n\n" +
          "RNN（循环神经网络）的思路：\n" +
          "• 每读一个词，更新一次「记忆」\n" +
          "• 这个记忆叫「隐藏状态」（hidden state）\n" +
          "• 下一个词的处理会考虑之前的所有记忆\n\n" +
          "打个比方：你在读一本书。\n" +
          "• 读完第 1 章，你脑子里有了第 1 章的印象\n" +
          "• 读第 2 章时，你会联系第 1 章的内容来理解\n" +
          "• 读第 3 章时，你同时记得前两章的内容\n\n" +
          "RNN 就是这样工作的：每个时间步都接收新输入 + 上一步的记忆，输出新记忆。",
        formula: "h_t = \\tanh(W_{hh} h_{t-1} + W_{xh} x_t + b)",
        animation: "/videos/rnn-unfold.mp4",
      },
      {
        id: "vanishing-gradient",
        title: "RNN 的致命问题：梯度消失",
        explanation:
          "RNN 的训练用的是「时间反向传播」（BPTT）——把网络沿时间步展开，然后用反向传播。\n\n" +
          "问题是：如果序列很长（比如一篇 1000 字的文章），梯度要从最后一步传回第一步。每传一步，梯度都会乘以一个小于 1 的数。传了很多步之后，梯度就几乎变成 0 了。\n\n" +
          "这意味着：网络很难学到「长期依赖」——比如文章开头提到的主角名字，到结尾时网络可能已经忘了。",
        animation: "/videos/rnn-unfold.mp4",
      },
      {
        id: "lstm",
        title: "LSTM——学会选择性遗忘",
        explanation:
          "1997 年，LSTM（长短期记忆网络）专门解决梯度消失问题。\n\n" +
          "核心创新：引入了「细胞状态」（cell state）——一条信息高速公路。\n\n" +
          "LSTM 有三个「门」来控制信息流动：\n" +
          "1. 遗忘门：决定丢弃哪些旧信息\n" +
          "2. 输入门：决定存储哪些新信息\n" +
          "3. 输出门：决定输出哪些信息\n\n" +
          "打个比方：考试前复习。\n" +
          "• 遗忘门：忘掉不重要的细节（课本页码）\n" +
          "• 输入门：记住重要的公式和概念\n" +
          "• 输出门：考试时只回忆和题目相关的知识",
        animation: "/videos/lstm-gate-flow.mp4",
      },
      {
        id: "gru-seq2seq",
        title: "GRU 与 Seq2Seq",
        explanation:
          "GRU（2014）是 LSTM 的简化版：\n" +
          "• 把遗忘门和输入门合并成一个「更新门」\n" +
          "• 去掉了细胞状态，直接在隐藏状态上操作\n" +
          "• 参数更少，训练更快，效果差不多\n\n" +
          "Seq2Seq（序列到序列）架构：\n" +
          "• 编码器：读完整个输入序列，压缩成一个固定长度的向量\n" +
          "• 解码器：从这个向量开始，一个词一个词地生成输出\n\n" +
          "这就是机器翻译的基础架构。但长句子的信息会丢失，解决方案就是「注意力机制」—— Transformer 的前身。",
        animation: "/videos/rnn-unfold.mp4",
      },
    ],
    quizzes: [
      {
        id: "q3_2_1",
        question: "RNN 的作用是什么？",
        options: ["存储数据", "处理序列数据，保留历史信息", "显示图片", "加速计算"],
        correctIndex: 1,
        explanation: "RNN 通过隐藏状态保留历史信息，适合处理文本、语音等序列数据。",
      },
      {
        id: "q3_2_2",
        question: "LSTM 解决了什么问题？",
        options: ["计算速度问题", "梯度消失问题", "存储空间问题", "显示问题"],
        correctIndex: 1,
        explanation: "LSTM 通过引入细胞状态和门控机制，解决了 RNN 的梯度消失问题。",
      },
      {
        id: "q3_2_3",
        question: "GRU 和 LSTM 有什么区别？",
        options: ["GRU 更复杂", "GRU 是 LSTM 的简化版", "GRU 不能处理序列", "GRU 需要更多数据"],
        correctIndex: 1,
        explanation: "GRU 把遗忘门和输入门合并成更新门，参数更少，训练更快。",
      },
    ],
    backLink: { chapterId: "ch3", chapterTitle: "NLP基础" },
  },
  // ── Phase 2 ──
  ch4_lesson1: {
    derivationSteps: attentionDerivationSteps,
    bodyText:
      "注意力机制是 Transformer 的核心。它的作用是：让模型在处理每个词的时候，能「看到」句子中的所有其他词，并且知道该重点关注哪些。\n\n" +
      "【为什么需要注意力？】\n\n" +
      "考虑这句话：「那只猫坐在垫子上，它看起来很舒服。」\n\n" +
      "当模型读到「它」这个词时，需要知道「它」指的是什么。答案是「猫」。但 RNN 要一步一步传递信息，等到处理「它」的时候，「猫」的信息可能已经衰减了。\n\n" +
      "注意力机制让模型可以直接「跳回去」看「猫」，而且给「猫」更高的权重。\n\n" +
      "【Query、Key、Value——三个角色】\n\n" +
      "注意力机制用三个角色来类比信息检索：\n\n" +
      "• Query（查询）：你现在想找什么？比如「它指的是什么？」\n" +
      "• Key（键）：每个候选对象的标签。比如「猫」的标签是「动物、毛茸茸、会叫」\n" +
      "• Value（值）：每个候选对象的实际内容。比如「猫」的具体含义\n\n" +
      "注意力的计算过程：\n" +
      "1. Query 和每个 Key 做点积，得到匹配分数（「它」和「猫」匹配度很高）\n" +
      "2. 用 Softmax 把分数变成概率（所有概率加起来等于 1）\n" +
      "3. 用概率对所有 Value 加权求和，得到最终输出\n\n" +
      "【自注意力——自己关注自己】\n\n" +
      "在 Transformer 中，Query、Key、Value 都来自同一个句子。这就是「自」注意力——句子中的每个词都在关注句子中的所有其他词。\n\n" +
      "比如句子「我 爱 你」：\n" +
      "• 「我」会关注「爱」和「你」\n" +
      "• 「爱」会关注「我」和「你」\n" +
      "• 「你」会关注「我」和「爱」\n\n" +
      "每个词都「看到」了完整的上下文，这就是 Transformer 强大的原因。\n\n" +
      "【多头注意力——从多个角度看问题】\n\n" +
      "一个注意力头只能学到一种「关注模式」。但语言是复杂的，需要同时关注多种关系。\n\n" +
      "多头注意力：把 Q、K、V 拆成多份，每份独立计算注意力，最后拼接起来。\n\n" +
      "比如 8 头注意力：\n" +
      "• 头 1 可能关注语法关系（主语-谓语）\n" +
      "• 头 2 可能关注语义关系（同义词、反义词）\n" +
      "• 头 3 可能关注位置关系（相邻的词）\n" +
      "• ...其他头关注其他模式\n\n" +
      "【缩放点积——为什么要除以根号 d_k？】\n\n" +
      "注意力分数 = Q × K^T / sqrt(d_k)\n\n" +
      "为什么要除以 sqrt(d_k)？\n\n" +
      "如果 Q 和 K 的维度很大（比如 64），点积的结果会很大。Softmax 对大数值非常敏感——一个很大的数会让 Softmax 输出接近 one-hot（只有一个位置是 1，其他都是 0），梯度几乎为零，模型学不动。\n\n" +
      "除以 sqrt(d_k) 把数值缩放到合理范围，让 Softmax 的梯度更稳定。\n\n" +
      "【因果掩码——防止「偷看」未来】\n\n" +
      "在文本生成时，模型要一个词一个词地往后写。生成第 5 个词的时候，不应该看到第 6、7、8 个词（因为它们还没生成）。\n\n" +
      "因果掩码：在注意力分数矩阵中，把「未来位置」的分数设为负无穷。Softmax 之后，这些位置的权重就变成 0 了。\n\n" +
      "这就是为什么 GPT 是「自回归」模型——它只能看到前面的词，不能看到后面的词。\n\n" +
      "【注意力为什么强大？】\n\n" +
      "1. 直接建模长距离依赖：不管两个词隔多远，注意力都能直接建立联系\n" +
      "2. 可解释性：注意力权重告诉我们模型在「看」哪里\n" +
      "3. 并行计算：所有位置可以同时计算注意力（不像 RNN 必须按顺序）\n\n" +
      "GPT、BERT、LLaMA 等所有现代大语言模型都基于注意力机制。",
    concepts: [
      {
        id: "why-attention",
        title: "为什么需要注意力？",
        explanation:
          "考虑这句话：「那只猫坐在垫子上，它看起来很舒服。」\n\n" +
          "当模型读到「它」这个词时，需要知道「它」指的是什么。答案是「猫」。\n\n" +
          "但 RNN 要一步一步传递信息，等到处理「它」的时候，「猫」的信息可能已经衰减了。\n\n" +
          "注意力机制让模型可以直接「跳回去」看「猫」，而且给「猫」更高的权重。",
        animation: "/videos/attention-scaled-dot-product.mp4",
      },
      {
        id: "qkv",
        title: "Query、Key、Value——三个角色",
        explanation:
          "注意力机制用三个角色来类比信息检索：\n\n" +
          "• Query（查询）：你现在想找什么？比如「它指的是什么？」\n" +
          "• Key（键）：每个候选对象的标签。比如「猫」的标签是「动物、毛茸茸、会叫」\n" +
          "• Value（值）：每个候选对象的实际内容。比如「猫」的具体含义\n\n" +
          "注意力的计算过程：\n" +
          "1. Query 和每个 Key 做点积，得到匹配分数\n" +
          "2. 用 Softmax 把分数变成概率（所有概率加起来等于 1）\n" +
          "3. 用概率对所有 Value 加权求和，得到最终输出",
        formula:
          "\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V",
        animation: "/videos/attention-scaled-dot-product.mp4",
      },
      {
        id: "self-attention",
        title: "自注意力——自己关注自己",
        explanation:
          "在 Transformer 中，Query、Key、Value 都来自同一个句子。这就是「自」注意力——句子中的每个词都在关注句子中的所有其他词。\n\n" +
          "比如句子「我 爱 你」：\n" +
          "• 「我」会关注「爱」和「你」\n" +
          "• 「爱」会关注「我」和「你」\n" +
          "• 「你」会关注「我」和「爱」\n\n" +
          "每个词都「看到」了完整的上下文，这就是 Transformer 强大的原因。",
        animation: "/videos/attention-matrix-flow.mp4",
      },
      {
        id: "multi-head",
        title: "多头注意力——从多个角度看问题",
        explanation:
          "一个注意力头只能学到一种「关注模式」。但语言是复杂的，需要同时关注多种关系。\n\n" +
          "多头注意力：把 Q、K、V 拆成多份，每份独立计算注意力，最后拼接起来。\n\n" +
          "比如 8 头注意力：\n" +
          "• 头 1 可能关注语法关系（主语-谓语）\n" +
          "• 头 2 可能关注语义关系（同义词、反义词）\n" +
          "• 头 3 可能关注位置关系（相邻的词）\n" +
          "• ...其他头关注其他模式",
        formula: "\\text{MultiHead}(Q,K,V) = \\text{Concat}(head_1, \\ldots, head_h) W^O",
        animation: "/videos/attention-multi-head.mp4",
      },
      {
        id: "scaled-dot",
        title: "缩放点积——为什么要除以根号 d_k？",
        explanation:
          "注意力分数 = Q × K^T / sqrt(d_k)\n\n" +
          "为什么要除以 sqrt(d_k)？\n\n" +
          "如果 Q 和 K 的维度很大（比如 64），点积的结果会很大。Softmax 对大数值非常敏感——一个很大的数会让 Softmax 输出接近 one-hot，梯度几乎为零，模型学不动。\n\n" +
          "除以 sqrt(d_k) 把数值缩放到合理范围，让 Softmax 的梯度更稳定。",
        formula: "\\text{Score}(Q,K) = \\frac{Q \\cdot K^T}{\\sqrt{d_k}}",
        animation: "/videos/attention-scaled-dot-product.mp4",
      },
      {
        id: "causal-mask",
        title: "因果掩码——防止「偷看」未来",
        explanation:
          "在文本生成时，模型要一个词一个词地往后写。生成第 5 个词的时候，不应该看到第 6、7、8 个词（因为它们还没生成）。\n\n" +
          "因果掩码：在注意力分数矩阵中，把「未来位置」的分数设为负无穷。Softmax 之后，这些位置的权重就变成 0 了。\n\n" +
          "这就是为什么 GPT 是「自回归」模型——它只能看到前面的词，不能看到后面的词。",
        animation: "/videos/attention-matrix-flow.mp4",
      },
    ],
    backLink: { chapterId: "ch4", chapterTitle: "Transformer架构" },
  },
  ch4_lesson2: {
    derivationSteps: transformerArchDerivationSteps,
    bodyText:
      "Transformer 是一个「积木式」架构——用几个简单模块堆叠出强大的模型。\n\n" +
      "【整体结构】\n\n" +
      "Transformer 分为两部分：\n" +
      "• Encoder（编码器）：读输入，理解含义。BERT 用的就是只有 Encoder。\n" +
      "• Decoder（解码器）：生成输出。GPT 用的就是只有 Decoder。\n\n" +
      "在机器翻译中，Encoder 读完中文，Decoder 生成英文。在 ChatGPT 中，只用 Decoder——它一边读你的问题，一边生成回答。\n\n" +
      "【每一层的组成】\n\n" +
      "Transformer 的每一层由三个子模块组成：\n\n" +
      "1. 多头自注意力（Multi-Head Self-Attention）\n" +
      "   让每个位置「看到」所有其他位置，理解上下文。\n\n" +
      "2. 前馈网络（Feed-Forward Network, FFN）\n" +
      "   一个简单的两层神经网络：先放大 4 倍，再压缩回来。\n" +
      "   中间用激活函数（GELU）引入非线性。\n" +
      "   作用：对每个位置独立地做非线性变换。\n\n" +
      "3. 层归一化（Layer Normalization）\n" +
      "   把每个位置的向量「标准化」到均值 0、方差 1。\n" +
      "   作用：稳定训练，防止数值爆炸。\n\n" +
      "【残差连接——梯度高速公路】\n\n" +
      "每个子模块都有一个「残差连接」：\n" +
      "  输出 = 子模块(输入) + 输入\n\n" +
      "就是把原始输入直接加到输出上。\n\n" +
      "为什么需要这个？因为梯度反向传播时，如果网络很深，梯度会越来越小（梯度消失）。残差连接提供了一条「高速公路」——梯度可以跳过中间的计算，直接到达底层。\n\n" +
      "就像考试时：即使你中间步骤算错了，如果最后一步是对的，你也能拿到部分分数。\n\n" +
      "【Pre-Norm vs Post-Norm】\n\n" +
      "• Post-Norm（原始 Transformer）：先做子模块，再做归一化\n" +
      "• Pre-Norm（现在主流）：先做归一化，再做子模块\n\n" +
      "Pre-Norm 训练更稳定，因为归一化在前面，数值范围被控制住了。LLaMA、GPT-3 都用 Pre-Norm。\n\n" +
      "【位置编码——告诉模型词的顺序】\n\n" +
      "自注意力本身不关心顺序——「我爱你」和「你爱我」在没有位置信息时是一样的。\n\n" +
      "位置编码给每个位置一个独特的向量，加到输入上。这样模型就能区分「第 1 个词」和「第 5 个词」。\n\n" +
      "现代模型（如 LLaMA）用旋转位置编码（RoPE），让位置信息通过旋转矩阵编码，支持更长的序列。\n\n" +
      "【堆叠——为什么更深更强？】\n\n" +
      "单层 Transformer 只能做简单的模式匹配。但堆叠多层后，模型能学到层次化的表示：\n" +
      "• 底层：学词法特征（词性、形态）\n" +
      "• 中间层：学句法特征（主谓关系、从句结构）\n" +
      "• 高层：学语义特征（意图、情感、推理）\n\n" +
      "ChatGPT 有 96 层 Transformer，LLaMA-65B 有 80 层。层数越多，模型越强大。",
    concepts: [
      {
        id: "encoder-decoder",
        title: "整体结构：Encoder-Decoder",
        explanation:
          "Transformer 分为两部分：\n\n" +
          "• Encoder（编码器）：读输入，理解含义。BERT 用的就是只有 Encoder。\n" +
          "• Decoder（解码器）：生成输出。GPT 用的就是只有 Decoder。\n\n" +
          "在机器翻译中，Encoder 读完中文，Decoder 生成英文。在 ChatGPT 中，只用 Decoder——它一边读你的问题，一边生成回答。",
        animation: "/videos/nn-forward-pass.mp4",
      },
      {
        id: "transformer-block",
        title: "每一层的组成",
        explanation:
          "Transformer 的每一层由三个子模块组成：\n\n" +
          "1. 多头自注意力：让每个位置「看到」所有其他位置，理解上下文。\n\n" +
          "2. 前馈网络（FFN）：一个简单的两层神经网络，先放大 4 倍再压缩回来，用 GELU 激活。\n\n" +
          "3. 层归一化：把每个位置的向量标准化到均值 0、方差 1，稳定训练。",
        animation: "/videos/nn-forward-pass.mp4",
      },
      {
        id: "residual",
        title: "残差连接——梯度高速公路",
        explanation:
          "每个子模块都有一个「残差连接」：\n" +
          "  输出 = 子模块(输入) + 输入\n\n" +
          "就是把原始输入直接加到输出上。\n\n" +
          "为什么需要这个？因为梯度反向传播时，如果网络很深，梯度会越来越小（梯度消失）。残差连接提供了一条「高速公路」——梯度可以跳过中间的计算，直接到达底层。\n\n" +
          "就像考试时：即使你中间步骤算错了，如果最后一步是对的，你也能拿到部分分数。",
        formula: "x^{(l+1)} = x^{(l)} + \\text{Sublayer}(x^{(l)})",
      },
      {
        id: "position-encoding",
        title: "位置编码——告诉模型词的顺序",
        explanation:
          "自注意力本身不关心顺序——「我爱你」和「你爱我」在没有位置信息时是一样的。\n\n" +
          "位置编码给每个位置一个独特的向量，加到输入上。这样模型就能区分「第 1 个词」和「第 5 个词」。\n\n" +
          "现代模型（如 LLaMA）用旋转位置编码（RoPE），让位置信息通过旋转矩阵编码，支持更长的序列。",
      },
    ],
    quizzes: [
      {
        id: "q4_2_1",
        question: "Transformer 的 Encoder 用来做什么？",
        options: ["生成输出", "读输入，理解含义", "存储数据", "显示图片"],
        correctIndex: 1,
        explanation: "Encoder 用来读输入并理解其含义，BERT 就是只有 Encoder 的模型。",
      },
      {
        id: "q4_2_2",
        question: "残差连接的作用是什么？",
        options: ["加速计算", "提供梯度高速公路，防止梯度消失", "存储更多数据", "显示更多内容"],
        correctIndex: 1,
        explanation: "残差连接把原始输入直接加到输出上，让梯度可以跳过中间计算，直接到达底层。",
      },
      {
        id: "q4_2_3",
        question: "位置编码的作用是什么？",
        options: ["加速计算", "告诉模型词的顺序", "存储数据", "显示图片"],
        correctIndex: 1,
        explanation:
          "自注意力本身不关心顺序，位置编码给每个位置一个独特的向量，让模型能区分词的顺序。",
      },
    ],
    backLink: { chapterId: "ch4", chapterTitle: "Transformer架构" },
  },
  ch5_lesson1: {
    derivationSteps: lmObjectivesDerivationSteps,
    bodyText:
      "大语言模型是怎么「学会说话」的？答案是：通过预测下一个词。\n\n" +
      "【自回归语言建模——GPT 的训练方式】\n\n" +
      "GPT 的训练目标很简单：给定前面的词，预测下一个词。\n\n" +
      "比如这句话：「今天天气很___」\n" +
      "模型需要预测下一个词可能是「好」、「热」、「冷」等。\n\n" +
      "训练时，把一句话拆成多个预测任务：\n" +
      "• 输入「今天」→ 目标「天气」\n" +
      "• 输入「今天天气」→ 目标「很」\n" +
      "• 输入「今天天气很」→ 目标「好」\n\n" +
      "模型不断练习预测，直到能准确预测下一个词。\n\n" +
      "这就是「自回归」——一个词一个词地往后生成。\n\n" +
      "【因果掩码——防止作弊】\n\n" +
      "训练时，模型不应该「偷看」后面的词。比如：\n" +
      "• 输入「今天天气很」→ 目标「好」\n" +
      "• 如果模型能看到「好」，那就不是预测，而是背答案了\n\n" +
      "因果掩码确保模型在预测第 N 个词时，只能看到第 1 到 N-1 个词。\n\n" +
      "【掩码语言建模——BERT 的训练方式】\n\n" +
      "GPT 只能从左往右看。但有些任务需要同时看前后文。\n\n" +
      "BERT 的做法：随机掩盖一些词，让模型预测被掩盖的词。\n\n" +
      "比如：「今天[MASK]气很[MASK]」\n" +
      "模型需要同时利用「今天」和「很」来预测中间的词。\n\n" +
      "BERT 用双向上下文，所以学到了更强的语义表示。\n\n" +
      "【两种方式的对比】\n\n" +
      "• 自回归（GPT）：从左到右，适合生成任务（写文章、聊天）\n" +
      "• 掩码（BERT）：双向看，适合理解任务（分类、问答）\n\n" +
      "现在的大模型（GPT、LLaMA、Claude）都用自回归，因为生成能力更重要。\n\n" +
      "【预训练 + 微调——两步走】\n\n" +
      "第一步：预训练（Pre-training）\n" +
      "• 用海量文本（万亿字）训练语言模型\n" +
      "• 模型学会了语言的基本规律：语法、常识、推理\n" +
      "• 这一步需要大量算力（几千张 GPU 训练几个月）\n\n" +
      "第二步：微调（Fine-tuning）\n" +
      "• 用特定任务的数据（比如客服对话）进一步训练\n" +
      "• 模型学会在特定场景下怎么回答\n" +
      "• 这一步数据量小，时间短\n\n" +
      "ChatGPT 就是这样出来的：GPT-4 预训练后，用人类对话数据微调，再用 RLHF 对齐人类偏好。",
    concepts: [
      {
        id: "autoregressive",
        title: "自回归语言建模——预测下一个词",
        explanation:
          "GPT 的训练目标很简单：给定前面的词，预测下一个词。\n\n" +
          "比如：「今天天气很___」→ 可能是「好」、「热」、「冷」\n\n" +
          "训练时，把一句话拆成多个预测任务：\n" +
          "• 输入「今天」→ 目标「天气」\n" +
          "• 输入「今天天气」→ 目标「很」\n" +
          "• 输入「今天天气很」→ 目标「好」\n\n" +
          "模型不断练习预测，直到能准确预测下一个词。这就是「自回归」——一个词一个词地往后生成。",
      },
      {
        id: "causal-mask",
        title: "因果掩码——防止作弊",
        explanation:
          "训练时，模型不应该「偷看」后面的词。比如：\n\n" +
          "• 输入「今天天气很」→ 目标「好」\n" +
          "• 如果模型能看到「好」，那就不是预测，而是背答案了\n\n" +
          "因果掩码确保模型在预测第 N 个词时，只能看到第 1 到 N-1 个词。",
      },
      {
        id: "mlm",
        title: "掩码语言建模——BERT 的训练方式",
        explanation:
          "GPT 只能从左往右看。但有些任务需要同时看前后文。\n\n" +
          "BERT 的做法：随机掩盖一些词，让模型预测被掩盖的词。\n\n" +
          "比如：「今天[MASK]气很[MASK]」\n" +
          "模型需要同时利用「今天」和「很」来预测中间的词。\n\n" +
          "BERT 用双向上下文，所以学到了更强的语义表示。",
      },
      {
        id: "pretrain-finetune",
        title: "预训练 + 微调——两步走",
        explanation:
          "第一步：预训练（Pre-training）\n" +
          "• 用海量文本（万亿字）训练语言模型\n" +
          "• 模型学会了语言的基本规律：语法、常识、推理\n" +
          "• 这一步需要大量算力（几千张 GPU 训练几个月）\n\n" +
          "第二步：微调（Fine-tuning）\n" +
          "• 用特定任务的数据（比如客服对话）进一步训练\n" +
          "• 模型学会在特定场景下怎么回答\n" +
          "• 这一步数据量小，时间短\n\n" +
          "ChatGPT 就是这样出来的：GPT-4 预训练后，用人类对话数据微调，再用 RLHF 对齐人类偏好。",
      },
    ],
    quizzes: [
      {
        id: "q5_1_1",
        question: "GPT 是怎么训练的？",
        options: ["给它看图片", "预测下一个词", "让它玩游戏", "让它背课文"],
        correctIndex: 1,
        explanation: "GPT 通过预测下一个词来学习语言，这就是自回归语言建模。",
      },
      {
        id: "q5_1_2",
        question: "因果掩码的作用是什么？",
        options: ["加速训练", "防止模型偷看后面的词", "存储更多数据", "显示更多内容"],
        correctIndex: 1,
        explanation: "因果掩码确保模型在预测第 N 个词时，只能看到第 1 到 N-1 个词。",
      },
      {
        id: "q5_1_3",
        question: "BERT 和 GPT 有什么区别？",
        options: [
          "BERT 更大",
          "BERT 用掩码语言建模，GPT 用自回归",
          "BERT 不能处理文本",
          "GPT 是双向的",
        ],
        correctIndex: 1,
        explanation: "BERT 用掩码语言建模（双向看），GPT 用自回归（从左到右）。",
      },
    ],
    backLink: { chapterId: "ch5", chapterTitle: "预训练技术" },
  },
  ch5_lesson2: {
    derivationSteps: scalingLawsDerivationSteps,
    bodyText:
      "一个关键问题：怎么知道该训练多大的模型？用多少数据？花多少钱？\n\n" +
      "规模化定律（Scaling Laws）给出了答案。\n\n" +
      "【核心发现：幂律关系】\n\n" +
      "2020 年，OpenAI 的 Kaplan 等人发现：\n" +
      "• 模型的测试损失与参数量 N、数据量 D、计算量 C 之间存在幂律关系\n" +
      "• 翻译成人话：模型越大、数据越多、算力越足，性能就越好，而且这种提升是可预测的\n\n" +
      "幂律的意思是：性能提升和资源投入之间有一个固定的比例关系。\n\n" +
      "比如：\n" +
      "• 把模型参数量翻 10 倍，损失降低固定比例\n" +
      "• 把训练数据翻 10 倍，损失降低另一个固定比例\n\n" +
      "【为什么这很重要？】\n\n" +
      "有了这个规律，你可以：\n" +
      "• 用小模型做实验，预测大模型的表现\n" +
      "• 决定应该把钱花在「更大的模型」还是「更多的数据」上\n" +
      "• 估算训练一个模型需要多少算力和预算\n\n" +
      "【Chinchilla 定律——数据和模型要匹配】\n\n" +
      "2022 年，DeepMind 的 Hoffmann 等人发现了一个重要纠正：\n\n" +
      "之前的误区：模型越大越好（GPT-3 有 1750 亿参数）\n" +
      "实际情况：模型和数据需要按比例匹配\n\n" +
      "具体来说：\n" +
      "• 参数量翻倍时，训练数据量也应该翻倍\n" +
      "• 用太多参数但数据不够，模型会「过拟合」（背答案但不会举一反三）\n" +
      "• 用太少参数但数据很多，模型容量不够（学不了复杂的规律）\n\n" +
      "Chinchilla 70B 模型只有 700 亿参数（比 GPT-3 小 2.5 倍），但在 1.4 万亿 token 上训练（比 GPT-3 多几倍数据），性能反而更好。\n\n" +
      "【实际应用】\n\n" +
      "现在的训练策略：\n" +
      "• LLaMA-7B：70 亿参数，在 1 万亿 token 上训练\n" +
      "• LLaMA-65B：650 亿参数，在 1.4 万亿 token 上训练\n" +
      "• GPT-4：据传 1.8 万亿参数，在 13 万亿 token 上训练\n\n" +
      "规模化定律告诉我们：不要只追求大模型，数据质量和数量同样重要。这就是为什么 Meta 开源 LLaMA 后，社区能在相对小的模型上训练出很好的效果——因为他们用了大量的高质量数据。",
    concepts: [
      {
        id: "power-law",
        title: "核心发现：幂律关系",
        explanation:
          "2020 年，OpenAI 发现：模型的测试损失与参数量 N、数据量 D、计算量 C 之间存在幂律关系。\n\n" +
          "翻译成人话：模型越大、数据越多、算力越足，性能就越好，而且这种提升是可预测的。\n\n" +
          "比如：\n" +
          "• 把模型参数量翻 10 倍，损失降低固定比例\n" +
          "• 把训练数据翻 10 倍，损失降低另一个固定比例",
      },
      {
        id: "chinchilla",
        title: "Chinchilla 定律——数据和模型要匹配",
        explanation:
          "2022 年，DeepMind 发现了一个重要纠正：\n\n" +
          "之前的误区：模型越大越好（GPT-3 有 1750 亿参数）\n" +
          "实际情况：模型和数据需要按比例匹配\n\n" +
          "具体来说：\n" +
          "• 参数量翻倍时，训练数据量也应该翻倍\n" +
          "• 用太多参数但数据不够，模型会「过拟合」\n" +
          "• 用太少参数但数据很多，模型容量不够\n\n" +
          "Chinchilla 70B 只有 700 亿参数（比 GPT-3 小 2.5 倍），但在 1.4 万亿 token 上训练，性能反而更好。",
      },
    ],
    quizzes: [
      {
        id: "q5_2_1",
        question: "规模化定律告诉我们什么？",
        options: ["模型越小越好", "模型越大、数据越多，性能越好", "数据不重要", "算力不重要"],
        correctIndex: 1,
        explanation: "规模化定律表明模型的性能与参数量、数据量、计算量之间存在可预测的幂律关系。",
      },
      {
        id: "q5_2_2",
        question: "Chinchilla 定律的核心发现是什么？",
        options: ["模型越大越好", "模型和数据需要按比例匹配", "数据越多越好", "算力越强越好"],
        correctIndex: 1,
        explanation:
          "Chinchilla 定律发现模型和数据需要按比例匹配，用太多参数但数据不够会导致过拟合。",
      },
      {
        id: "q5_2_3",
        question: "过拟合是什么？",
        options: ["模型学得太好", "模型背答案但不会举一反三", "模型太小", "数据太多"],
        correctIndex: 1,
        explanation:
          "过拟合是指模型在训练数据上表现很好，但在新数据上表现很差——就像背答案但不会举一反三。",
      },
    ],
    backLink: { chapterId: "ch5", chapterTitle: "预训练技术" },
  },
  ch6_lesson1: {
    derivationSteps: gptSeriesDerivationSteps,
    bodyText:
      "GPT 系列是 OpenAI 开发的大语言模型家族，从 GPT-1 到 GPT-4，每一代都带来了质的飞跃。\n\n" +
      "【GPT-1（2018）——证明预训练有效】\n\n" +
      "在此之前，AI 做 NLP 任务的方式是：针对每个任务（情感分析、问答、翻译）单独训练一个模型。\n\n" +
      "GPT-1 的创新：先在大量文本上预训练一个通用语言模型，再用少量标注数据微调到具体任务。\n\n" +
      "这就像：先让一个人广泛阅读（预训练），再让他参加具体考试（微调）。\n\n" +
      "GPT-1 有 1.17 亿参数，12 层 Transformer。它证明了「预训练 + 微调」范式的有效性。\n\n" +
      "【GPT-2（2019）——零样本学习】\n\n" +
      "GPT-2 有 15 亿参数，48 层。更大的规模带来了新的能力：\n\n" +
      "• 零样本学习（Zero-shot）：不用任何示例，直接给指令就能完成任务\n" +
      "• 比如：给 GPT-2 输入「翻译成法语：Hello world」，它能直接输出「Bonjour le monde」\n\n" +
      "OpenAI 当时认为这太危险了，一度不敢公开发布完整模型。\n\n" +
      "【GPT-3（2020）——涌现能力】\n\n" +
      "GPT-3 有 1750 亿参数，96 层。规模再次带来了质变：\n\n" +
      "• 上下文学习（In-Context Learning）：在 Prompt 中给几个示例，模型就能学会新任务\n" +
      "• 比如：给 3 个「英文→法文」的示例，GPT-3 就能翻译新的英文句子\n" +
      "• 不需要任何训练数据，不需要微调\n\n" +
      "这就是「涌现能力」——当模型足够大时，会突然出现小模型完全没有的能力。\n\n" +
      "【InstructGPT（2022）——对齐人类偏好】\n\n" +
      "GPT-3 很强，但有个问题：它学会了「说话」，但不一定说「对」的话。它可能会编造事实、产生有害内容、回答不相关。\n\n" +
      "解决方案：RLHF（基于人类反馈的强化学习）\n\n" +
      "步骤：\n" +
      "1. 让模型生成多个回答\n" +
      "2. 人类标注哪个回答更好\n" +
      "3. 训练一个「奖励模型」来模拟人类判断\n" +
      "4. 用强化学习让模型最大化奖励\n\n" +
      "这样训练出来的模型（InstructGPT）更听话、更有用、更安全。\n\n" +
      "【GPT-4（2023）——多模态 + 更强推理】\n\n" +
      "GPT-4 不仅能处理文字，还能理解图片。它在各种专业考试（律师、医生、数学竞赛）中表现出色。\n\n" +
      "GPT-4 的具体架构没有公开，但据传是 MoE（混合专家）架构，参数量可能达到万亿级别。\n\n" +
      "【从 GPT 看 LLM 发展规律】\n\n" +
      "GPT 系列的发展揭示了几个重要规律：\n" +
      "1. 规模很重要：更大的模型 + 更多的数据 = 更强的能力\n" +
      "2. 预训练是基础：通用能力来自广泛阅读\n" +
      "3. 对齐是关键：让模型说「对」的话比让模型说「多」的话更重要\n" +
      "4. 涌现能力：某些能力只在足够大的模型中才会出现",
    concepts: [
      {
        id: "gpt1",
        title: "GPT-1（2018）——证明预训练有效",
        explanation:
          "在此之前，AI 做 NLP 任务的方式是：针对每个任务单独训练一个模型。\n\n" +
          "GPT-1 的创新：先在大量文本上预训练一个通用语言模型，再用少量标注数据微调到具体任务。\n\n" +
          "这就像：先让一个人广泛阅读（预训练），再让他参加具体考试（微调）。\n\n" +
          "GPT-1 有 1.17 亿参数，12 层 Transformer。它证明了「预训练 + 微调」范式的有效性。",
      },
      {
        id: "gpt2-gpt3",
        title: "GPT-2/3——规模带来涌现能力",
        explanation:
          "GPT-2（2019）有 15 亿参数，展现了零样本学习能力——不用任何示例，直接给指令就能完成任务。\n\n" +
          "GPT-3（2020）有 1750 亿参数，带来了「涌现能力」：\n" +
          "• 上下文学习（In-Context Learning）：在 Prompt 中给几个示例，模型就能学会新任务\n" +
          "• 不需要任何训练数据，不需要微调\n\n" +
          "这就是「涌现能力」——当模型足够大时，会突然出现小模型完全没有的能力。",
      },
      {
        id: "instructgpt",
        title: "InstructGPT——对齐人类偏好",
        explanation:
          "GPT-3 很强，但有个问题：它学会了「说话」，但不一定说「对」的话。\n\n" +
          "解决方案：RLHF（基于人类反馈的强化学习）\n\n" +
          "步骤：\n" +
          "1. 让模型生成多个回答\n" +
          "2. 人类标注哪个回答更好\n" +
          "3. 训练一个「奖励模型」来模拟人类判断\n" +
          "4. 用强化学习让模型最大化奖励\n\n" +
          "这样训练出来的模型更听话、更有用、更安全。",
      },
      {
        id: "gpt4",
        title: "GPT-4——多模态 + 更强推理",
        explanation:
          "GPT-4 不仅能处理文字，还能理解图片。它在各种专业考试（律师、医生、数学竞赛）中表现出色。\n\n" +
          "GPT-4 的具体架构没有公开，但据传是 MoE（混合专家）架构，参数量可能达到万亿级别。\n\n" +
          "从 GPT 看 LLM 发展规律：\n" +
          "1. 规模很重要：更大的模型 + 更多的数据 = 更强的能力\n" +
          "2. 预训练是基础：通用能力来自广泛阅读\n" +
          "3. 对齐是关键：让模型说「对」的话比让模型说「多」的话更重要\n" +
          "4. 涌现能力：某些能力只在足够大的模型中才会出现",
      },
    ],
    quizzes: [
      {
        id: "q6_1_1",
        question: "GPT-1 的主要贡献是什么？",
        options: ["证明了预训练有效", "证明了微调有效", "证明了数据不重要", "证明了模型越小越好"],
        correctIndex: 0,
        explanation: "GPT-1 证明了「预训练 + 微调」范式的有效性——先广泛阅读，再参加具体考试。",
      },
      {
        id: "q6_1_2",
        question: "GPT-3 的涌现能力是什么？",
        options: ["模型变大了", "某些能力只在足够大的模型中才会出现", "模型变小了", "数据变少了"],
        correctIndex: 1,
        explanation: "涌现能力是指某些能力只在足够大的模型中才会出现，小模型完全没有这些能力。",
      },
      {
        id: "q6_1_3",
        question: "RLHF 的作用是什么？",
        options: ["加速训练", "让模型说「对」的话", "存储更多数据", "显示更多内容"],
        correctIndex: 1,
        explanation: "RLHF 通过人类反馈来对齐模型，让它说「对」的话而不是说「多」的话。",
      },
    ],
    backLink: { chapterId: "ch6", chapterTitle: "主流LLM架构" },
  },
  ch6_lesson2: {
    derivationSteps: openSourceLLMDerivationSteps,
    bodyText:
      "Meta 开源的 LLaMA 系列彻底改变了 LLM 生态，让研究者和开发者在可控制的资源下也能训练和微调大模型。LLaMA 使用 Pre-Norm + RMSNorm 简化归一化、RoPE 旋转位置编码支持长度外推、SwiGLU 门控激活提升效率。KV-Cache 是自回归推理的核心加速技术，将每步计算复杂度从 O(t·d²) 降至 O(d²)。MoE（混合专家）通过门控路由稀疏激活专家子网络——Mixtral 8x7B 每 token 只激活约 13B 参数，达到密集模型 30B+ 的效果。",
    backLink: { chapterId: "ch6", chapterTitle: "主流LLM架构" },
  },
  ch7_lesson1: {
    derivationSteps: loraDerivationSteps,
    bodyText:
      "微调是让预训练大模型适应特定任务的关键步骤。但全量微调太贵了。\n\n" +
      "【全量微调的问题】\n\n" +
      "一个 7B 参数的模型：\n" +
      "• 全精度存储：7B × 4 字节 = 28 GB\n" +
      "• 训练时的梯度和优化器状态：又是好几十 GB\n" +
      "• 微调一个任务就要保存一份完整模型\n\n" +
      "如果你有 10 个不同的任务，就要保存 10 份 28 GB 的模型。这太浪费了。\n\n" +
      "【LoRA 的核心洞察】\n\n" +
      "2021 年，微软的 Hu 等人发现了一个重要规律：\n\n" +
      "预训练模型在微调时，权重的更新量很小，而且是「低秩」的。\n\n" +
      "翻译成人话：虽然模型有几百万个参数，但微调时真正需要改变的参数其实很少，而且这些改变之间有很多重复。\n\n" +
      "打个比方：你有一幅画（预训练模型），想把它改成另一个风格（微调）。你不需要重新画整幅画，只需要在上面加几笔（低秩更新）。\n\n" +
      "【LoRA 怎么做？】\n\n" +
      "LoRA 的做法：\n" +
      "1. 冻结原始权重 W₀（不动）\n" +
      "2. 引入两个小矩阵 A 和 B\n" +
      "3. 只训练 A 和 B\n" +
      "4. 最终权重 = W₀ + A × B\n\n" +
      "参数量对比：\n" +
      "• 全量微调：4096 × 4096 = 1677 万参数\n" +
      "• LoRA（r=8）：4096 × 8 + 8 × 4096 = 6.5 万参数\n" +
      "• 压缩比：256 倍！\n\n" +
      "效果：用不到 1% 的参数，达到和全量微调差不多的效果。\n\n" +
      "【QLoRA——更极致的压缩】\n\n" +
      "QLoRA 在 LoRA 基础上加了量化：\n" +
      "• 把原始权重从 16-bit 压缩到 4-bit\n" +
      "• 训练时用 16-bit 精度，推理时用 4-bit\n" +
      "• 双重量化：连量化参数本身也压缩\n\n" +
      "效果：65B 模型的微调可以在单张 48GB 显卡上完成（原来需要几百 GB）。\n\n" +
      "【实际应用】\n\n" +
      "• Alpaca：斯坦福用 LoRA 在 LLaMA-7B 上微调，用 5.2 万条指令数据，效果接近 GPT-3.5\n" +
      "• Vicuna：用 LoRA 在 LLaMA-13B 上微调，用 ShareGPT 对话数据\n" +
      "• 你现在就可以用 LoRA 在自己的电脑上微调一个专属助手",
    backLink: { chapterId: "ch7", chapterTitle: "模型微调" },
  },
  ch7_lesson2: {
    derivationSteps: alignmentDerivationSteps,
    bodyText:
      "大模型学会了「说话」，但不一定说「对」的话。怎么让模型更有用、更安全？\n\n" +
      "【问题：模型会「胡说八道」】\n\n" +
      "预训练后的模型（base model）会续写文本，但不会「回答问题」。\n\n" +
      "比如你问：「中国的首都是哪里？」\n" +
      "预训练模型可能会续写：「中国的首都是哪里？这个问题的答案是北京，但 also 上海也是一个重要的城市...」\n\n" +
      "它在「续写」而不是「回答」。而且可能给出错误信息。\n\n" +
      "【SFT——监督微调】\n\n" +
      "第一步：用「指令-回答」对训练模型。\n\n" +
      "数据格式：\n" +
      "• 指令：「中国的首都是哪里？」\n" +
      "• 回答：「中国的首都是北京。」\n\n" +
      "经过 SFT 后，模型学会了「看到指令就回答」的模式。\n\n" +
      "但 SFT 有个问题：模型学会了「一种回答方式」，但不知道哪种回答更好。\n\n" +
      "【RLHF——让人类当老师】\n\n" +
      "第二步：用人类反馈来训练。\n\n" +
      "步骤：\n" +
      "1. 让模型对同一个问题生成多个回答\n" +
      "2. 人类标注哪个回答更好（A 比 B 好，B 比 C 好...）\n" +
      "3. 训练一个「奖励模型」来模拟人类判断\n" +
      "4. 用强化学习（PPO 算法）让模型最大化奖励\n\n" +
      "打个比方：\n" +
      "• SFT 像是给学生一本教科书（告诉他标准答案）\n" +
      "• RLHF 像是请家教（根据学生的回答给出反馈，告诉他哪种回答更好）\n\n" +
      "【PPO——稳定的强化学习】\n\n" +
      "PPO（Proximal Policy Optimization）是 OpenAI 提出的强化学习算法。\n\n" +
      "核心思想：限制每次更新的步长，防止模型「学歪」。\n\n" +
      "就像教孩子走路：\n" +
      "• 如果一次纠正太多，孩子会困惑\n" +
      "• 如果每次只纠正一点点，孩子能稳步改进\n\n" +
      "PPO 就是「每次只改一点点」的策略。\n\n" +
      "【DPO——更简单的对齐方法】\n\n" +
      "2023 年，斯坦福提出了 DPO（Direct Preference Optimization）。\n\n" +
      "核心思想：不需要单独训练奖励模型，直接从人类偏好数据中学习。\n\n" +
      "DPO 把 RLHF 简化成一个分类问题：\n" +
      "• 给定一对回答（好的 vs 差的）\n" +
      "• 训练模型给好的回答更高概率\n\n" +
      "优势：训练更简单、更稳定、不需要强化学习。\n\n" +
      "【对齐的重要性】\n\n" +
      "没有对齐的模型：\n" +
      "• 可能生成有害内容\n" +
      "• 可能编造事实（幻觉）\n" +
      "• 可能不理解用户的真正意图\n\n" +
      "经过对齐的模型：\n" +
      "• 有用：能准确回答问题\n" +
      "• 诚实：不知道的会说不知道\n" +
      "• 安全：拒绝有害请求\n\n" +
      "ChatGPT、Claude、Gemini 都经过了严格的对齐训练。",
    backLink: { chapterId: "ch7", chapterTitle: "模型微调" },
  },
  ch8_lesson1: {
    derivationSteps: quantizationDerivationSteps,
    bodyText:
      "大模型太大了，怎么在普通电脑上跑？答案是：量化——降低精度。\n\n" +
      "【为什么需要量化？】\n\n" +
      "一个 70B 模型：\n" +
      "• FP32（32-bit 浮点）：70B × 4 字节 = 280 GB\n" +
      "• FP16（16-bit 浮点）：70B × 2 字节 = 140 GB\n" +
      "• INT8（8-bit 整数）：70B × 1 字节 = 70 GB\n" +
      "• INT4（4-bit 整数）：70B × 0.5 字节 = 35 GB\n\n" +
      "量化就是把高精度数字转换成低精度数字。35 GB 就能在一张消费级显卡上跑了。\n\n" +
      "【量化会损失精度吗？】\n\n" +
      "会，但损失很小。\n\n" +
      "打个比方：\n" +
      "• 原始温度：23.456789°C（FP32）\n" +
      "• 量化后：23.5°C（INT8）\n" +
      "• 差异：0.043211°C\n\n" +
      "对于大多数应用，这个误差可以忽略不计。\n\n" +
      "【对称量化 vs 非对称量化】\n\n" +
      "对称量化：\n" +
      "• 把数值范围 [-max, max] 均匀映射到 [-127, 127]\n" +
      "• 零点在中间（0 → 0）\n" +
      "• 实现简单，适合权重分布大致对称的情况\n\n" +
      "非对称量化：\n" +
      "• 把实际范围 [min, max] 映射到 [0, 255]\n" +
      "• 零点不在中间\n" +
      "• 精度更好，但推理时多一次加法\n\n" +
      "【GPTQ 和 AWQ——高级量化方法】\n\n" +
      "简单量化（如 Round-to-Nearest）会损失较多精度。高级方法通过更聪明的策略减少损失：\n\n" +
      "• GPTQ：逐层量化，每量化一个权重后，调整其他权重来补偿误差\n" +
      "• AWQ：保护重要的权重不被量化（「激活感知」量化）\n\n" +
      "效果：4-bit 量化下，精度损失通常在 1-5% 以内。\n\n" +
      "【实际应用】\n\n" +
      "• llama.cpp：在 CPU 上运行量化后的 LLaMA，MacBook 也能跑\n" +
      "• GPTQ：用 AutoGPTQ 库量化模型，配合 vLLM 使用\n" +
      "• GGUF：llama.cpp 使用的量化格式，支持多种精度\n\n" +
      "量化让大模型从「云端专属」变成了「人人可用」。",
    backLink: { chapterId: "ch8", chapterTitle: "量化与部署" },
  },
  ch8_lesson2: {
    derivationSteps: inferenceOptimizationDerivationSteps,
    bodyText:
      "模型训练好后，怎么让它快速回答问题？这就是推理优化。\n\n" +
      "【自回归生成的瓶颈】\n\n" +
      "大模型生成文本是一个词一个词往后写。每生成一个词，都需要：\n" +
      "1. 把之前所有词的 Key 和 Value 重新计算一遍\n" +
      "2. 和新词做注意力计算\n\n" +
      "如果生成 100 个词，就要重复 100 次。这太慢了。\n\n" +
      "【KV-Cache——缓存历史计算结果】\n\n" +
      "KV-Cache 的做法：\n" +
      "• 第 1 步：计算所有词的 K 和 V，存起来\n" +
      "• 第 2 步：新词只需要计算自己的 Q、K、V，然后和缓存的 K、V 做注意力\n" +
      "• 第 3 步：把新的 K、V 追加到缓存\n\n" +
      "效果：每步计算量从 O(t²) 降到 O(t)。\n\n" +
      "缺点：KV-Cache 需要大量显存。一个 70B 模型生成 4096 个 token 的 KV-Cache 可能需要 40+ GB。\n\n" +
      "【PagedAttention——显存管理的创新】\n\n" +
      "传统 KV-Cache：为每个请求预分配最大长度的显存。如果实际生成很短，就浪费了。\n\n" +
      "PagedAttention（vLLM 的核心创新）：\n" +
      "• 把 KV-Cache 分成固定大小的「页」\n" +
      "• 按需分配，用多少分多少\n" +
      "• 不同请求可以共享页\n\n" +
      "效果：显存利用率提升约 4 倍，服务更多并发用户。\n\n" +
      "【连续批处理——提升吞吐量】\n\n" +
      "传统批处理：等一批请求全部完成，才处理下一批。快的请求要等慢的。\n\n" +
      "连续批处理：在序列粒度动态调度。一个序列完成后，立即插入新序列。\n\n" +
      "效果：吞吐量提升 2-10 倍。\n\n" +
      "【Speculative Decoding——用小模型加速大模型】\n\n" +
      "思路：用一个小模型（比如 7B）快速生成草稿（比如 5 个词），然后用大模型（比如 70B）一次性验证。\n\n" +
      "• 如果大模型同意草稿，直接接受（省了 4 次大模型计算）\n" +
      "• 如果大模型不同意，从分歧点重新生成\n\n" +
      "效果：加速 2-3 倍，质量不变。\n\n" +
      "【TensorRT-LLM——NVIDIA 的推理加速】\n\n" +
      "NVIDIA 的 TensorRT-LLM 把多种优化技术打包：\n" +
      "• 量化（INT4/INT8）\n" +
      "• KV-Cache 优化\n" +
      "• 算子融合（把多个小计算合并成一个大计算）\n" +
      "• CUDA Graph（减少 CPU-GPU 通信开销）\n\n" +
      "效果：在 NVIDIA 显卡上，推理速度比原始 PyTorch 快 3-5 倍。",
    backLink: { chapterId: "ch8", chapterTitle: "量化与部署" },
  },
  ch9_lesson1: {
    derivationSteps: promptEngineeringDerivationSteps,
    bodyText:
      "怎么和大模型「说话」才能得到最好的回答？这就是 Prompt 工程。\n\n" +
      "【Zero-shot——直接下指令】\n\n" +
      "最简单的方式：直接告诉模型你要什么。\n\n" +
      "比如：\n" +
      "• 「翻译成英文：今天天气很好」\n" +
      "• 「总结这篇文章：...」\n" +
      "• 「写一首关于春天的诗」\n\n" +
      "模型依靠预训练学到的知识来完成任务。对于简单任务，效果不错。\n\n" +
      "【Few-shot——给几个示例】\n\n" +
      "如果任务比较复杂，可以在 Prompt 中给几个示例。\n\n" +
      "比如情感分析：\n" +
      "「判断以下评论的情感：\n" +
      "评论：这个产品太棒了！→ 正面\n" +
      "评论：质量很差，不推荐 → 负面\n" +
      "评论：还行吧，一般般 → ?」\n\n" +
      "模型会从示例中学习模式，然后应用到新问题上。\n\n" +
      "关键：示例的质量和数量直接影响效果。通常 3-5 个示例就够了。\n\n" +
      "【思维链（CoT）——让模型展示推理过程】\n\n" +
      "对于数学和逻辑问题，直接让模型回答往往不准确。\n\n" +
      "思维链的做法：在示例中加入推理步骤。\n\n" +
      "比如：\n" +
      "「问题：小明有 5 个苹果，给了小红 2 个，又买了 3 个，现在有几个？\n" +
      "推理过程：\n" +
      "1. 初始：5 个苹果\n" +
      "2. 给了小红 2 个：5 - 2 = 3 个\n" +
      "3. 又买了 3 个：3 + 3 = 6 个\n" +
      "答案：6 个」\n\n" +
      "模型会模仿这种逐步推理的方式，大大提升准确率。\n\n" +
      "【Self-Consistency——多次投票】\n\n" +
      "同一个问题，让模型回答多次（用较高的温度），然后投票选最多的答案。\n\n" +
      "原理：正确答案更容易被多次独立采样到。\n\n" +
      "效果：准确率提升 10-20%。\n\n" +
      "【Prompt 工程的最佳实践】\n\n" +
      "1. 任务要明确：不要说「帮我处理一下」，要说「用三句话总结这篇文章」\n" +
      "2. 给足上下文：告诉模型背景信息、目标受众、输出格式\n" +
      "3. 用示例：尤其是复杂任务，Few-shot 比 Zero-shot 效果好很多\n" +
      "4. 分步思考：对于推理任务，要求模型「一步步想」\n" +
      "5. 设定角色：「你是一个资深的 Python 工程师...」\n\n" +
      "Prompt 工程不需要编程，但需要对模型能力有深入理解。",
    backLink: { chapterId: "ch9", chapterTitle: "应用开发" },
  },
  ch9_lesson2: {
    derivationSteps: ragAgentDerivationSteps,
    bodyText:
      "大模型有两个致命缺陷：知识有截止日期、会编造事实（幻觉）。怎么解决？\n\n" +
      "【RAG——让模型「查资料】\n\n" +
      "RAG（检索增强生成）的思路：在回答问题之前，先搜索相关资料，把资料喂给模型，让它基于资料回答。\n\n" +
      "步骤：\n" +
      "1. 用户提问：「2024 年诺贝尔物理学奖得主是谁？」\n" +
      "2. 搜索知识库：找到相关文档\n" +
      "3. 把文档和问题一起发给模型\n" +
      "4. 模型基于文档回答\n\n" +
      "这样模型就不会「编造」了，因为它有资料可查。\n\n" +
      "【向量数据库——快速搜索相似内容】\n\n" +
      "传统搜索（如 Google）用关键词匹配。但很多问题用关键词搜不到。\n\n" +
      "比如：「怎么让 Python 程序运行更快？」\n" +
      "• 关键词搜索可能找到「Python 速度」「优化」等文章\n" +
      "• 但最相关的可能是「PyPy vs CPython 性能对比」这样的文章（没有「优化」这个词）\n\n" +
      "向量数据库的做法：\n" +
      "1. 把所有文档转换成向量（用 embedding 模型）\n" +
      "2. 用户的问题也转换成向量\n" +
      "3. 用向量相似度（如余弦相似度）找到最相关的文档\n\n" +
      "效果：能搜到「语义相关」的内容，而不仅仅是「关键词匹配」。\n\n" +
      "常见的向量数据库：Pinecone、Milvus、Chroma、FAISS\n\n" +
      "【Agent——能动手的 AI】\n\n" +
      "RAG 让模型能「查资料」。Agent 让模型能「动手做事」。\n\n" +
      "Agent 的核心是「工具调用」：\n" +
      "• 模型说：「我需要查一下今天的天气」\n" +
      "• 系统调用天气 API\n" +
      "• 模型拿到结果，继续推理\n\n" +
      "ReAct 框架：\n" +
      "• Thought（思考）：我需要查天气\n" +
      '• Action（行动）：调用 get_weather("北京")\n' +
      "• Observation（观察）：返回「晴，25°C」\n" +
      "• Thought（思考）：用户问的是北京天气，现在有结果了\n" +
      "• Action（回答）：北京今天晴，25°C\n\n" +
      "【实际应用】\n\n" +
      "• ChatGPT 的联网搜索：就是 RAG 的实现\n" +
      "• ChatGPT 的代码执行：就是 Agent 的工具调用\n" +
      "• 企业知识库问答：用 RAG 让模型基于内部文档回答\n" +
      "• 自动化工作流：用 Agent 让模型自动完成多步骤任务\n\n" +
      "RAG + Agent 是让大模型从「聊天机器人」变成「智能助手」的关键技术。",
    backLink: { chapterId: "ch9", chapterTitle: "应用开发" },
  },
};

export function getLessonContent(id: string): LessonContent | undefined {
  return lessonContent[id];
}
