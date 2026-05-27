import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, BookOpen, FileText, Video, ExternalLink } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  type: "paper" | "book" | "video" | "course";
  description: string;
  url: string;
}

const resources: Resource[] = [
  {
    id: "1",
    title: "Attention Is All You Need",
    type: "paper",
    description: "提出了Transformer架构，采用自注意力机制，完全抛弃了循环神经网络。",
    url: "https://arxiv.org/abs/1706.03762",
  },
  {
    id: "2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    type: "paper",
    description: "提出了BERT模型，通过预训练和微调的方式，在多种NLP任务上取得了突破性进展。",
    url: "https://arxiv.org/abs/1810.04805",
  },
];

const typeIcons = {
  paper: FileText,
  book: BookOpen,
  video: Video,
  course: BookOpen,
};

export function Resources() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">学习资源库</h1>
        <p className="text-gray-600">收集整理的LLM学习相关资源</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">搜索</CardTitle>
            </CardHeader>
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索资源..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="space-y-4">
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>没有找到匹配的资源</p>
              </div>
            ) : (
              filteredResources.map((resource) => {
                const IconComponent = typeIcons[resource.type];
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${resource.type === "paper" ? "bg-blue-50" : "bg-green-50"}`}>
                        <IconComponent className={`w-5 h-5 ${resource.type === "paper" ? "text-blue-600" : "text-green-600"}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{resource.title}</h3>
                        <p className="text-sm text-gray-600">{resource.description}</p>
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
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}