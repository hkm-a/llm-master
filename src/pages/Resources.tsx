import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, FileText, Github, ExternalLink, BookOpen, Globe } from "lucide-react";
import { chapters } from "@/lib/content/chapters";

interface ResourceItem {
  id: string;
  title: string;
  url: string;
  type: "paper" | "blog" | "github" | "book";
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
}

/**
 * Derive a human-readable title from a URL when no explicit title is mapped.
 * Handles common patterns: arxiv papers, GitHub repos, blog posts.
 */
function deriveTitleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    // GitHub repos: "owner/repo"
    if (u.hostname === "github.com") {
      const parts = u.pathname.replace(/^\//, "").split("/");
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    }
    // arxiv papers: extract ID
    if (u.hostname === "arxiv.org") {
      const match = url.match(/abs\/(\d+\.\d+)/);
      if (match) return `arXiv: ${match[1]}`;
    }
    // Generic: use path segments, title-cased
    const path = u.pathname.replace(/\/$/g, "").split("/").pop() || u.hostname;
    return path
      .replace(/[-_]/g, " ")
      .replace(/\.(html?|php|aspx)$/i, "")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return url;
  }
}

const paperTitles: Record<string, string> = {
  "https://arxiv.org/abs/1706.03762": "Attention Is All You Need",
  "https://arxiv.org/abs/2001.08361": "Scaling Laws for Neural Language Models",
  "https://arxiv.org/abs/2005.14165": "Language Models are Few-Shot Learners (GPT-3)",
  "https://arxiv.org/abs/2302.13971": "LLaMA: Open and Efficient Foundation Language Models",
  "https://arxiv.org/abs/2106.09685": "LoRA: Low-Rank Adaptation of Large Language Models",
  "https://arxiv.org/abs/2305.14314": "Direct Preference Optimization (DPO)",
};

const blogTitles: Record<string, string> = {
  "https://www.3blue1brown.com/topics/linear-algebra": "3Blue1Brown — 线性代数的本质",
  "https://colah.github.io/posts/2015-08-Backprop/": "Colah — 反向传播详解",
  "https://jalammar.github.io/illustrated-word2vec/": "Jalammar — 图解 Word2Vec",
  "https://jalammar.github.io/illustrated-transformer/": "Jalammar — 图解 Transformer",
  "https://jalammar.github.io/illustrated-gpt2/": "Jalammar — 图解 GPT-2",
  "https://lilianweng.github.io/posts/2019-01-31-lm/": "Lilian Weng — 语言模型综述",
  "https://huggingface.co/blog/rlhf": "Hugging Face — RLHF 入门指南",
};

const githubTitles: Record<string, string> = {
  "https://github.com/karpathy/nn-spiral": "Karpathy — 神经网络可视化",
  "https://github.com/karpathy/nanogpt": "Karpathy — nanoGPT 最小实现",
  "https://github.com/meta-llama/llama": "Meta — LLaMA 官方仓库",
  "https://github.com/unslothai/unsloth": "Unsloth — 高效模型微调",
  "https://github.com/ggerganov/llama.cpp": "llama.cpp — CPU 推理引擎",
  "https://github.com/vllm-project/vllm": "vLLM — 高性能推理引擎",
  "https://github.com/langchain-ai/langchain": "LangChain — LLM 应用框架",
  "https://github.com/run-llama/llama_index": "LlamaIndex — 数据索引框架",
};

const titleMaps: Record<string, Record<string, string>> = {
  paper: paperTitles,
  blog: blogTitles,
  github: githubTitles,
};

function buildResources(): ResourceItem[] {
  const items: ResourceItem[] = [];
  let id = 0;
  const resolveTitle = (type: string, url: string) =>
    titleMaps[type]?.[url] ?? deriveTitleFromUrl(url);

  for (const ch of chapters) {
    for (const paper of ch.resources.papers) {
      items.push({
        id: `paper-${id++}`,
        title: resolveTitle("paper", paper),
        url: paper,
        type: "paper",
        chapterId: ch.id,
        chapterTitle: ch.title,
        chapterOrder: ch.order,
      });
    }
    for (const blog of ch.resources.blogs) {
      items.push({
        id: `blog-${id++}`,
        title: resolveTitle("blog", blog),
        url: blog,
        type: "blog",
        chapterId: ch.id,
        chapterTitle: ch.title,
        chapterOrder: ch.order,
      });
    }
    for (const repo of ch.resources.github) {
      items.push({
        id: `github-${id++}`,
        title: resolveTitle("github", repo),
        url: repo,
        type: "github",
        chapterId: ch.id,
        chapterTitle: ch.title,
        chapterOrder: ch.order,
      });
    }
  }
  return items;
}

const allResources = buildResources();

const typeConfig = {
  paper:   { icon: FileText,   label: "论文",   color: "text-blue-600",   bg: "bg-blue-50" },
  blog:    { icon: Globe,      label: "博客",   color: "text-emerald-600", bg: "bg-emerald-50" },
  github:  { icon: Github,     label: "GitHub", color: "text-gray-700",   bg: "bg-gray-100" },
  book:    { icon: BookOpen,   label: "书籍",   color: "text-purple-600", bg: "bg-purple-50" },
};

const sortOrder: Record<string, number> = { paper: 0, blog: 1, github: 2, book: 3 };

export function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const filteredResources = allResources.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab = !activeTab || r.type === activeTab;
    return matchSearch && matchTab;
  });

  const tabCounts = {
    paper: allResources.filter((r) => r.type === "paper").length,
    blog: allResources.filter((r) => r.type === "blog").length,
    github: allResources.filter((r) => r.type === "github").length,
    book: allResources.filter((r) => r.type === "book").length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">学习资源库</h1>
        <p className="text-gray-600 dark:text-gray-400">
          从课程章节中汇总的论文、博客和开源项目，辅助深入学习
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">搜索与筛选</CardTitle>
            </CardHeader>
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索资源..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                />
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !activeTab
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  全部 ({allResources.length})
                </button>
                {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((key) => {
                  const cfg = typeConfig[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(activeTab === key ? null : key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === key
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      {cfg.label} ({tabCounts[key]})
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>没有找到匹配的资源</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResources
                .sort((a, b) => sortOrder[a.type] - sortOrder[b.type] || a.chapterOrder - b.chapterOrder)
                .map((resource) => {
                  const cfg = typeConfig[resource.type];
                  const IconComponent = cfg.icon;
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      layout
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${cfg.bg} shrink-0`}>
                          <IconComponent className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {resource.title}
                            </h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                              第{resource.chapterOrder}章
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {resource.chapterTitle}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(resource.url, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          访问
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
