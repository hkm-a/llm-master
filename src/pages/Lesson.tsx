import { useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Code, BookOpen, ChevronLeft, ChevronRight, Lightbulb, ExternalLink, FileText, Github, BookOpen as BookIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DerivationViewer } from "@/components/derivation/DerivationViewer";
import { getLessonContent } from "@/lib/content/lessons";
import { chapters, getChapterById } from "@/lib/content/chapters";

export function Lesson() {
  const { id } = useParams<{ id: string }>();
  const content = getLessonContent(id || "");

  const allLessons = useMemo(() => chapters.flatMap((c) => c.lessons), []);
  const lessonMeta = useMemo(
    () => allLessons.find((l) => l.id === id),
    [allLessons, id],
  );
  const lessonTitle = lessonMeta?.title ?? id;

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

  const navigate = useNavigate();
  const chapter = getChapterById(content.backLink.chapterId);

  // ── Prev / Next navigation ──
  const flatLessonIds = useMemo(
    () => chapters.flatMap((c) => c.lessons.map((l) => l.id)),
    [],
  );
  const { prevId, nextId, prevMeta, nextMeta } = useMemo(() => {
    const currentIndex = flatLessonIds.indexOf(id || "");
    const prev = currentIndex > 0 ? flatLessonIds[currentIndex - 1] : null;
    const next =
      currentIndex < flatLessonIds.length - 1
        ? flatLessonIds[currentIndex + 1]
        : null;
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

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── Key Takeaways extraction ──
  const keyTakeaways = useMemo(() => {
    const takeaways: string[] = [];
    const steps = content.derivationSteps;
    if (content.bodyText.length > 0) {
      const firstSentence = content.bodyText.split("。")[0];
      if (firstSentence) takeaways.push(firstSentence + "。");
    }
    steps.forEach((step) => {
      const sentences = step.explanation.split("。").filter(Boolean);
      const keySentence = sentences[0];
      if (keySentence && keySentence.length > 15) {
        takeaways.push(keySentence + "。");
      }
    });
    const unique = takeaways.filter(
      (t, i) => takeaways.findIndex((o) => o.startsWith(t.slice(0, 20))) === i,
    );
    return unique.slice(0, 5);
  }, [content]);

  // ── Sandbox template mapping ──
  const lessonToTemplate: Record<string, { id: string; name: string }> = {
    ch4_lesson1: { id: "attention", name: "自注意力实现" },
    ch2_lesson2: { id: "backprop", name: "反向传播演示" },
    ch7_lesson1: { id: "lora", name: "LoRA实现" },
  };
  const sandboxTemplate = useMemo(
    () => lessonToTemplate[id ?? ""] ?? null,
    [id],
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/chapter/${content.backLink.chapterId}`}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回{chapter ? `第${chapter.order}章` : "章节"}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{lessonTitle}</h1>
        <p className="text-gray-600 dark:text-gray-400">
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
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>前往<Link to="/sandbox" className="text-blue-600 hover:underline">实验沙盒</Link>运行相关代码模板</p>
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
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">核心概念</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{content.bodyText}</p>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">数学基础</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            建议掌握线性代数（矩阵运算、特征值分解）、微积分（链式法则、梯度）和概率论（Softmax、熵）等基础知识。
          </p>
        </div>
      </Card>

      {/* ── Key Takeaways ── */}
      {keyTakeaways.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <CardTitle>核心要点</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {keyTakeaways.map((takeaway, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                  {takeaway}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── Inline Code Examples ── */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-500" />
            <CardTitle>代码实践</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {sandboxTemplate ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {sandboxTemplate.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  在沙盒中运行并修改此代码模板，加深对概念的理解
                </div>
              </div>
              <Link
                to={`/sandbox?template=${sandboxTemplate.id}`}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                打开沙盒
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  在沙盒中自由编写和运行 Python 代码，实践 LLM 相关技术
                </div>
              </div>
              <Link
                to="/sandbox"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                打开沙盒
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Further Reading ── */}
      {chapter?.resources && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookIcon className="w-5 h-5 text-orange-500" />
              <CardTitle>延伸阅读</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {chapter.resources.papers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  论文
                </h4>
                <ul className="space-y-1">
                  {chapter.resources.papers.map((url, i) => (
                    <li key={i}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {url.replace("https://arxiv.org/abs/", "arxiv: ")}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {chapter.resources.blogs.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">博客 / 教程</h4>
                <ul className="space-y-1">
                  {chapter.resources.blogs.map((url, i) => (
                    <li key={i}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {url.replace(/https?:\/\//, "").replace(/\/.*$/, "")}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {chapter.resources.github.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                  <Github className="w-4 h-4" />
                  GitHub 仓库
                </h4>
                <ul className="space-y-1">
                  {chapter.resources.github.map((url, i) => (
                    <li key={i}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <Github className="w-3 h-3" />
                        {url.replace("https://github.com/", "")}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Prev / Next navigation */}
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
