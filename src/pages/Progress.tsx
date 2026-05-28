import { useProgressStore, useProgressPercent, useCompletedCount, useInProgressCount, useTotalCount } from "@/stores/progressStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Trophy, BookOpen, CheckCircle2, Clock, Target } from "lucide-react";
import { chapters, getChapterById } from "@/lib/content/chapters";
import { Link } from "react-router-dom";

export function Progress() {
  const progress = useProgressStore((s) => s.progress);
  const updateLessonProgress = useProgressStore((s) => s.updateLessonProgress);
  const totalProgress = useProgressPercent();
  const completedLessons = useCompletedCount();
  const totalLessons = useTotalCount();
  const inProgressLessons = useInProgressCount();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          学习进度
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          追踪你的学习历程，见证成长轨迹
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalProgress}%</div>
              <div className="text-blue-100 text-sm">总进度</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{completedLessons}</div>
              <div className="text-green-100 text-sm">已完成课程</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{inProgressLessons}</div>
              <div className="text-yellow-100 text-sm">进行中</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalLessons}</div>
              <div className="text-purple-100 text-sm">总课程数</div>
            </div>
          </div>
        </motion.div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>总体进度条</CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">完成进度</span>
            <span className="text-sm font-medium text-blue-600">{totalProgress}%</span>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {chapters.map((chapter, index) => {
          const chapterProgress = Math.round(
            (chapter.lessons.filter((l) => progress[l.id] === "completed").length /
              chapter.lessons.length) *
              100
          );

          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {chapter.order}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{chapter.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{chapter.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{chapterProgress}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {chapter.lessons.filter((l) => progress[l.id] === "completed").length} / {chapter.lessons.length} 课程
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${chapterProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {chapter.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`p-3 rounded-lg text-left transition-colors relative group ${
                        progress[lesson.id] === "completed"
                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                        : progress[lesson.id] === "in_progress"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                        : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {progress[lesson.id] === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : progress[lesson.id] === "in_progress" ? (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <span className="w-4 h-4 bg-gray-300 rounded-full" />
                        )}
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {lesson.order}. {lesson.title}
                        </span>
                      </div>
                      <div className={`text-xs ${
                     progress[lesson.id] === "completed" ? "text-green-600 dark:text-green-400" :
                     progress[lesson.id] === "in_progress" ? "text-yellow-600 dark:text-yellow-400" :
                     "text-gray-400 dark:text-gray-500"
                      }`}>
                        {progress[lesson.id] === "completed" ? "已完成" :
                         progress[lesson.id] === "in_progress" ? "进行中" :
                         "未开始"}
                      </div>
                      {/* Hover actions: navigate + toggle status */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/lesson/${lesson.id}`}
                          className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          aria-label={`前往 ${lesson.title}`}
                        >
                          前往
                        </Link>
                        <button
                          onClick={() => updateLessonProgress(lesson.id, progress[lesson.id] === "completed" ? "not_started" : "completed")}
                          className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                          aria-label={progress[lesson.id] === "completed" ? `标记 ${lesson.title} 为未完成` : `标记 ${lesson.title} 为已完成`}
                        >
                          {progress[lesson.id] === "completed" ? "撤销" : "完成"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <CardTitle>成就徽章</CardTitle>
          </div>
        </CardHeader>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {(() => {
              const ch1 = getChapterById("ch1");
              const ch4 = getChapterById("ch4");
              return [
                { name: "初学者", desc: "完成第一章", earned: completedLessons >= 3 },
                { name: "数学达人", desc: "完成数学基础", earned: ch1 ? ch1.lessons.every((l) => progress[l.id] === "completed") : false },
                { name: "Transformer专家", desc: "完成核心架构", earned: ch4 ? ch4.lessons.every((l) => progress[l.id] === "completed") : false },
                { name: "LLM大师", desc: "完成全部课程", earned: totalProgress === 100 },
              ];
            })().map((badge, index) => (
              <motion.div
                key={index}
                className={`flex flex-col items-center p-4 rounded-lg ${
                   badge.earned ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" : "bg-gray-100 dark:bg-gray-800 opacity-50"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
               <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                   badge.earned ? "bg-yellow-400" : "bg-gray-300 dark:bg-gray-600"
                 }`}>
                  <Trophy className={`w-6 h-6 ${badge.earned ? "text-yellow-900" : "text-gray-500"}`} />
                </div>
                <div className={`text-sm font-medium ${badge.earned ? "text-yellow-800 dark:text-yellow-300" : "text-gray-500 dark:text-gray-400"}`}>
                  {badge.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{badge.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}