import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Code, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { DerivationViewer } from "@/components/derivation/DerivationViewer";
import { getLessonContent } from "@/lib/content/lessons";
import { getChapterById } from "@/lib/content/chapters";

export function Lesson() {
  const { id } = useParams<{ id: string }>();
  const content = getLessonContent(id || "");

  if (!content) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习路径
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            课程: {id}
          </h1>
          <p className="text-gray-600">课程内容将在后续阶段填充。</p>
        </div>
        <Card>
          <CardHeader>
            <BookOpen className="w-5 h-5 text-green-500" />
            <CardTitle>课程内容</CardTitle>
          </CardHeader>
          <div className="p-4 text-center py-12 text-gray-500">
            <p>该课程内容正在准备中...</p>
          </div>
        </Card>
      </div>
    );
  }

  const chapter = getChapterById(content.backLink.chapterId);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/chapter/${content.backLink.chapterId}`}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回{chapter ? `第${chapter.order}章` : "章节"}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">课程: {id}</h1>
        <p className="text-gray-600">
          通过交互式动画学习核心概念
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-500" />
              <CardTitle>公式推导动画</CardTitle>
            </div>
          </CardHeader>
          <div className="p-4">
            <DerivationViewer steps={content.derivationSteps} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-500" />
              <CardTitle>代码实验沙盒</CardTitle>
            </div>
          </CardHeader>
          <div className="text-center py-12 text-gray-500">
            <p>代码沙盒将在 Phase 3 实现</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            <CardTitle>课程内容</CardTitle>
          </div>
        </CardHeader>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2">核心概念</h3>
          <p className="text-sm text-gray-600 mb-4">{content.bodyText}</p>
          <h3 className="font-medium text-gray-900 mb-2">数学基础</h3>
          <p className="text-sm text-gray-600">
            建议掌握线性代数（矩阵运算、特征值分解）、微积分（链式法则、梯度）和概率论（Softmax、熵）等基础知识。
          </p>
        </div>
      </Card>
    </div>
  );
}
