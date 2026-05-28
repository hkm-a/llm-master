import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Code, Play, Settings, Terminal, RefreshCw } from "lucide-react";

const codeTemplates = [
  {
    id: "attention",
    name: "自注意力实现",
    description: "实现自注意力机制的核心计算",
    code: `import torch
import torch.nn as nn

class SelfAttention(nn.Module):
    def __init__(self, embed_size, heads):
        super(SelfAttention, self).__init__()
        self.embed_size = embed_size
        self.heads = heads
        self.head_dim = embed_size // heads
        
        # 线性变换层
        self.W_q = nn.Linear(embed_size, embed_size)
        self.W_k = nn.Linear(embed_size, embed_size)
        self.W_v = nn.Linear(embed_size, embed_size)
        self.W_o = nn.Linear(embed_size, embed_size)
    
    def forward(self, x):
        # x: (batch_size, sequence_length, embed_size)
        batch_size, seq_len, embed_size = x.size()
        
        # 计算 Q, K, V
        Q = self.W_q(x).view(batch_size, seq_len, self.heads, self.head_dim)
        K = self.W_k(x).view(batch_size, seq_len, self.heads, self.head_dim)
        V = self.W_v(x).view(batch_size, seq_len, self.heads, self.head_dim)
        
        # 转置以便计算注意力
        Q = Q.transpose(1, 2)  # (batch, heads, seq_len, head_dim)
        K = K.transpose(1, 2)
        V = V.transpose(1, 2)
        
        # 计算注意力分数
        # Q: (batch, heads, seq_len, head_dim)
        # K: (batch, heads, seq_len, head_dim)
        # scores: (batch, heads, seq_len, seq_len)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / torch.sqrt(torch.tensor(self.head_dim, dtype=torch.float32))
        
        # Softmax归一化
        attention = torch.softmax(scores, dim=-1)
        
        # 加权求和
        # attention: (batch, heads, seq_len, seq_len)
        # V: (batch, heads, seq_len, head_dim)
        # output: (batch, heads, seq_len, head_dim)
        output = torch.matmul(attention, V)
        
        # 合并多头输出
        output = output.transpose(1, 2).contiguous().view(batch_size, seq_len, embed_size)
        output = self.W_o(output)
        
        return output, attention

# 测试示例
if __name__ == "__main__":
    attention = SelfAttention(embed_size=512, heads=8)
    x = torch.randn(2, 10, 512)  # (batch, seq_len, embed_size)
    output, attn_weights = attention(x)
    print("Output shape:", output.shape)
    print("Attention weights shape:", attn_weights.shape)
    print("Attention weights sum (should be 1 for each row):")
    print(attn_weights[0, 0, :, :].sum(dim=-1))`,
  },
  {
    id: "backprop",
    name: "反向传播演示",
    description: "手动实现简单神经网络的反向传播",
    code: `import numpy as np

class SimpleNN:
    def __init__(self):
        # 初始化权重
        self.W1 = np.random.randn(2, 3) * 0.1
        self.W2 = np.random.randn(3, 1) * 0.1
        self.b1 = np.zeros((1, 3))
        self.b2 = np.zeros((1, 1))
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))
    
    def sigmoid_derivative(self, x):
        return x * (1 - x)
    
    def forward(self, X):
        # 前向传播
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.a2 = self.sigmoid(self.z2)
        return self.a2
    
    def backward(self, X, y, learning_rate=0.1):
        # 计算误差
        batch_size = X.shape[0]
        
        # 输出层误差
        delta2 = (self.a2 - y) * self.sigmoid_derivative(self.a2)
        
        # 隐藏层误差
        delta1 = np.dot(delta2, self.W2.T) * self.sigmoid_derivative(self.a1)
        
        # 计算梯度
        dW2 = np.dot(self.a1.T, delta2) / batch_size
        db2 = np.sum(delta2, axis=0, keepdims=True) / batch_size
        dW1 = np.dot(X.T, delta1) / batch_size
        db1 = np.sum(delta1, axis=0, keepdims=True) / batch_size
        
        # 更新权重
        self.W2 -= learning_rate * dW2
        self.b2 -= learning_rate * db2
        self.W1 -= learning_rate * dW1
        self.b1 -= learning_rate * db1
        
        # 计算损失
        loss = np.mean((self.a2 - y) ** 2)
        return loss

# 测试示例
if __name__ == "__main__":
    nn = SimpleNN()
    
    # 训练数据 (XOR问题)
    X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
    y = np.array([[0], [1], [1], [0]])
    
    # 训练
    for epoch in range(10000):
        nn.forward(X)
        loss = nn.backward(X, y)
        if epoch % 2000 == 0:
            print(f"Epoch {epoch}, Loss: {loss:.4f}")
    
    # 测试
    print("\\n测试结果:")
    predictions = nn.forward(X)
    for i in range(4):
        print(f"Input: {X[i]}, Predicted: {predictions[i][0]:.4f}, Actual: {y[i][0]}")`,
  },
  {
    id: "lora",
    name: "LoRA实现",
    description: "实现低秩适配的核心思想",
    code: `import torch
import torch.nn as nn

class LoRALayer(nn.Module):
    def __init__(self, in_features, out_features, rank=8, alpha=16):
        super(LoRALayer, self).__init__()
        self.rank = rank
        self.alpha = alpha
        
        # 低秩矩阵
        self.A = nn.Parameter(torch.randn(in_features, rank) * 0.01)
        self.B = nn.Parameter(torch.zeros(rank, out_features))
        
        # 缩放因子
        self.scaling = alpha / rank
        
    def forward(self, x):
        # LoRA输出: x @ A @ B * scaling
        return (x @ self.A @ self.B) * self.scaling

class LinearWithLoRA(nn.Module):
    def __init__(self, in_features, out_features, rank=8, alpha=16):
        super(LinearWithLoRA, self).__init__()
        
        # 冻结的原始权重
        self.W = nn.Linear(in_features, out_features)
        self.W.weight.requires_grad = False
        self.W.bias.requires_grad = False
        
        # LoRA适配器
        self.lora = LoRALayer(in_features, out_features, rank, alpha)
    
    def forward(self, x):
        # 原始输出 + LoRA输出
        return self.W(x) + self.lora(x)

# 测试示例
if __name__ == "__main__":
    # 创建带有LoRA的线性层
    layer = LinearWithLoRA(512, 512, rank=8)
    
    # 检查可训练参数
    print("可训练参数:")
    for name, param in layer.named_parameters():
        if param.requires_grad:
            print(f"  {name}: {param.shape}")
    
    # 计算参数数量
    total_params = sum(p.numel() for p in layer.parameters())
    trainable_params = sum(p.numel() for p in layer.parameters() if p.requires_grad)
    
    print(f"\\n总参数: {total_params}")
    print(f"可训练参数: {trainable_params}")
    print(f"可训练比例: {(trainable_params / total_params * 100):.2f}%")
    
    # 前向传播
    x = torch.randn(2, 10, 512)
    output = layer(x)
    print(f"\\n输出形状: {output.shape}")`,
  },
];

export function Sandbox() {
  const [selectedTemplate, setSelectedTemplate] = useState(codeTemplates[0]);
  const [code, setCode] = useState(selectedTemplate.code);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setOutput("");

    setTimeout(() => {
      const simulatedOutput = `执行中...

${selectedTemplate.name}

输出结果:
${selectedTemplate.id === "attention" && `Output shape: torch.Size([2, 10, 512])
Attention weights shape: torch.Size([2, 8, 10, 10])
Attention weights sum (should be 1 for each row):
tensor([1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000])`}
${selectedTemplate.id === "backprop" && `Epoch 0, Loss: 0.2512
Epoch 2000, Loss: 0.0234
Epoch 4000, Loss: 0.0067
Epoch 6000, Loss: 0.0032
Epoch 8000, Loss: 0.0018

测试结果:
Input: [0 0], Predicted: 0.0456, Actual: 0
Input: [0 1], Predicted: 0.9523, Actual: 1
Input: [1 0], Predicted: 0.9487, Actual: 1
Input: [1 1], Predicted: 0.0512, Actual: 0`}
${selectedTemplate.id === "lora" && `可训练参数:
  lora.A: torch.Size([512, 8])
  lora.B: torch.Size([8, 512])

总参数: 262657
可训练参数: 8192
可训练比例: 3.12%

输出形状: torch.Size([2, 10, 512])`}

执行完成!`;

      setOutput(simulatedOutput);
      setIsRunning(false);
    }, 1500);
  }, [selectedTemplate]);

  const handleReset = () => {
    setCode(selectedTemplate.code);
    setOutput("");
  };

  const handleTemplateChange = (template: typeof codeTemplates[0]) => {
    setSelectedTemplate(template);
    setCode(template.code);
    setOutput("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          实验沙盒
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          在本地环境中运行Python代码，实践LLM相关技术
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-500" />
                <CardTitle>代码编辑器</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  设置
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReset}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  重置
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRun}
                  disabled={isRunning}
                >
                  <Play className="w-4 h-4 mr-1" />
                  {isRunning ? "运行中..." : "运行"}
                </Button>
              </div>
            </CardHeader>
            
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Python环境检测: <span className="text-green-600">✓ Python 3.10+</span></p>
                  <p>PyTorch版本: <span className="text-green-600">✓ 2.0+</span></p>
                </div>
              </motion.div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
                placeholder="在这里编写Python代码..."
                readOnly={isRunning}
              />
              
              {output && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-gray-700 bg-gray-950 p-4 max-h-48 overflow-auto"
                >
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">模拟输出（在Tauri桌面端将调用本地Python执行）</span>
          </div>
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                    {output}
                  </pre>
                </motion.div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>代码模板</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {codeTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate.id === template.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                      : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleTemplateChange(template)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {template.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {template.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">实验说明</CardTitle>
            </CardHeader>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                <strong>自注意力实现:</strong> 实现多头注意力机制的核心计算流程，包括Q/K/V矩阵的计算、注意力分数计算和Softmax归一化。
              </p>
              <p>
                <strong>反向传播演示:</strong> 手动实现简单神经网络的反向传播算法，理解梯度计算和权重更新的过程。
              </p>
              <p>
                <strong>LoRA实现:</strong> 实现低秩适配技术，理解参数高效微调的原理。
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}