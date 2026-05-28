import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, Github } from "lucide-react";
import { getChapterById } from "@/lib/content/chapters";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LessonCard } from "@/components/learning/LessonCard";
import { useProgressStore } from "@/stores/progressStore";

export function Chapter() {
  const { id } = useParams<{ id: string }>();
  const chapter = getChapterById(id || "");
  const progress = useProgressStore((s) => s.progress);
  const updateLessonProgress = useProgressStore((s) => s.updateLessonProgress);

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          章节不存在
        </h2>
        <Link to="/">
          <Button variant="secondary">返回首页</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回学习路径
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          第{chapter.order}章: {chapter.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{chapter.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>课程列表</CardTitle>
              <CardDescription>
                {chapter.lessons.length > 0
                  ? `${chapter.lessons.length} 个课程`
                  : "课程内容即将上线"}
              </CardDescription>
            </CardHeader>
            <div className="space-y-3">
              {chapter.lessons.length > 0
                ? chapter.lessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      status={progress[lesson.id] || "not_started"}
                      onClick={() => {
                        if (progress[lesson.id] === "not_started") {
                          updateLessonProgress(lesson.id, "in_progress");
                        }
                      }}
                    />
                  ))
                : (
                  <div className="text-center py-8 text-gray-500">
                    <p>该章节课程内容正在准备中...</p>
                    <p className="text-sm mt-2">敬请期待!</p>
                  </div>
                )}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>相关资源</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {chapter.resources.papers.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                     论文
                  </h4>
                  {chapter.resources.papers.map((paper, i) => (
                    <a
                      key={i}
                      href={paper}
                      target="_blank"
                      rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-1"
                  >
                    <FileText className="w-4 h-4" />
                    查看论文
                    <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}

              {chapter.resources.github.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                     GitHub项目
                  </h4>
                  {chapter.resources.github.map((repo, i) => (
                    <a
                      key={i}
                      href={repo}
                      target="_blank"
                      rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-1"
                  >
                    <Github className="w-4 h-4" />
                    查看项目
                    <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}

              {chapter.resources.blogs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                     博客文章
                  </h4>
                  {chapter.resources.blogs.map((blog, i) => (
                    <a
                      key={i}
                      href={blog}
                      target="_blank"
                      rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    阅读博客
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
