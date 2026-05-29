import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  Code,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormulaDisplay } from "@/components/derivation/FormulaDisplay";
import { Quiz } from "@/components/learning/Quiz";
import { getLessonContent } from "@/lib/content/lessons";
import { chapters, getChapterById } from "@/lib/content/chapters";
import type { Concept } from "@/lib/content/types";

export function Lesson() {
  const { id } = useParams<{ id: string }>();
  const content = getLessonContent(id || "");
  const [conceptIdx, setConceptIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  const allLessons = useMemo(() => chapters.flatMap((c) => c.lessons), []);
  const lessonMeta = useMemo(() => allLessons.find((l) => l.id === id), [allLessons, id]);
  const lessonTitle = lessonMeta?.title ?? id;

  const chapter = content ? getChapterById(content.backLink.chapterId) : null;
  const concepts = content?.concepts || [];
  const currentConcept: Concept | undefined = concepts[conceptIdx];

  // ── Prev / Next navigation ──
  const flatLessonIds = useMemo(() => chapters.flatMap((c) => c.lessons.map((l) => l.id)), []);
  const { prevId, nextId, prevMeta, nextMeta } = useMemo(() => {
    const currentIndex = flatLessonIds.indexOf(id || "");
    const prev = currentIndex > 0 ? flatLessonIds[currentIndex - 1] : null;
    const next = currentIndex < flatLessonIds.length - 1 ? flatLessonIds[currentIndex + 1] : null;
    return {
      prevId: prev,
      nextId: next,
      prevMeta: prev ? allLessons.find((l) => l.id === prev) : null,
      nextMeta: next ? allLessons.find((l) => l.id === next) : null,
    };
  }, [flatLessonIds, id, allLessons]);

  // ── Keyboard shortcuts ──
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && prevId) {
        navigate(`/lesson/${prevId}`);
      } else if (e.key === "ArrowRight" && nextId) {
        navigate(`/lesson/${nextId}`);
      }
    },
    [prevId, nextId, navigate]
  );

  // Reset concept index when lesson changes
  useEffect(() => {
    setConceptIdx(0);
    setIsPlaying(false);
  }, [id]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── Concept navigation ──
  const goNextConcept = () => {
    if (conceptIdx < concepts.length - 1) {
      setConceptIdx(conceptIdx + 1);
      setIsPlaying(false);
    }
  };
  const goPrevConcept = () => {
    if (conceptIdx > 0) {
      setConceptIdx(conceptIdx - 1);
      setIsPlaying(false);
    }
  };

  // ── Auto-play concepts ──
  useEffect(() => {
    if (!isPlaying || concepts.length === 0) return;
    const timer = setTimeout(() => {
      if (conceptIdx < concepts.length - 1) {
        setConceptIdx(conceptIdx + 1);
      } else {
        setIsPlaying(false);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isPlaying, conceptIdx, concepts.length]);

  if (!content) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习路径
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {lessonTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">课程内容将在后续阶段填充。</p>
        </div>
        <Card>
          <CardHeader>
            <BookOpen className="w-5 h-5 text-green-500" />
            <CardTitle>课程内容</CardTitle>
          </CardHeader>
          <div className="p-4 text-center py-12 text-gray-500 dark:text-gray-400">
            <p>该课程内容正在准备中...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/chapter/${content.backLink.chapterId}`}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回{chapter ? `第${chapter.order}章` : "章节"}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{lessonTitle}</h1>
      </div>

      {/* Concept tabs */}
      {concepts.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {concepts.map((c, i) => (
            <button
              key={c.id}
              onClick={() => {
                setConceptIdx(i);
                setIsPlaying(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                i === conceptIdx
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {i + 1}. {c.title}
            </button>
          ))}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`ml-2 p-2 rounded-lg transition-colors ${
              isPlaying
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            }`}
            title={isPlaying ? "暂停" : "自动播放"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Current concept */}
      {currentConcept && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Animation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-500" />
                <CardTitle>动画演示</CardTitle>
              </div>
            </CardHeader>
            <div className="p-4">
              {currentConcept.animation ? (
                <video
                  key={currentConcept.id}
                  src={currentConcept.animation}
                  controls
                  autoPlay
                  className="w-full rounded-lg bg-black"
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500">
                  <p>暂无动画</p>
                </div>
              )}
            </div>
          </Card>

          {/* Right: Explanation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-500" />
                <CardTitle>{currentConcept.title}</CardTitle>
              </div>
            </CardHeader>
            <div className="p-6">
              {/* Formula */}
              {currentConcept.formula && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FormulaDisplay formula={currentConcept.formula} />
                </div>
              )}
              {/* Explanation */}
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {currentConcept.explanation
                  .split("\n")
                  .filter(Boolean)
                  .map((para, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3"
                    >
                      {para}
                    </p>
                  ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Concept navigation */}
      {concepts.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goPrevConcept}
            disabled={conceptIdx === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            上一个概念
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {conceptIdx + 1} / {concepts.length}
          </span>
          <button
            onClick={goNextConcept}
            disabled={conceptIdx === concepts.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            下一个概念
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 核心要点 */}
      {content.bodyText && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <CardTitle>核心要点</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {content.bodyText
                .split("\n")
                .filter(Boolean)
                .map((para, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3"
                  >
                    {para}
                  </p>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 公式推导动画 */}
      {content.derivationSteps && content.derivationSteps.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-500" />
              <CardTitle>公式推导动画</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.derivationSteps.slice(0, 3).map((step) => (
                <div key={step.stepNumber} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {step.stepNumber}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {step.title}
                    </span>
                  </div>
                  <FormulaDisplay formula={step.formula} />
                </div>
              ))}
              {content.derivationSteps.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  共 {content.derivationSteps.length} 个推导步骤
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 代码实验沙盒 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-500" />
            <CardTitle>代码实验沙盒</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              理论结合实践，在交互式沙盒中运行代码模板
            </p>
            <Link to="/sandbox" className="inline-block">
              <Button>
                <Code className="w-4 h-4 mr-2" />
                打开实验沙盒
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 代码实践 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            <CardTitle>代码实践</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>动手练习：</strong>打开沙盒，尝试修改代码参数，观察输出变化。
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>思考题：</strong>如果改变注意力头的数量，会对模型产生什么影响？
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 交互式测验 */}
      {content.quizzes && content.quizzes.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧪</span>
              <CardTitle>课后测验</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">检验一下你学到的知识吧！</p>
              {content.quizzes.map((quiz) => (
                <Quiz key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 延伸阅读 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-indigo-500" />
            <CardTitle>延伸阅读</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 deep:text-gray-400">
              深入学习本节课内容，推荐以下资源：
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                <BookOpen className="w-4 h-4" />
                <span>查阅相关论文和文档</span>
              </li>
              <li className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                <Code className="w-4 h-4" />
                <span>查看开源实现代码</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Prev / Next lesson */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {prevId && prevMeta ? (
          <Link
            to={`/lesson/${prevId}`}
            className="flex-1 group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <ChevronLeft className="w-4 h-4" />
              <span>上一篇</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700">
              {prevMeta.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextId && nextMeta ? (
          <Link
            to={`/lesson/${nextId}`}
            className="flex-1 group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-right"
          >
            <div className="flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>下一篇</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700">
              {nextMeta.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
