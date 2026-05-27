import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useProgressStore, useProgressPercent, useCompletedCount } from "@/stores/progressStore";
import { Link } from "react-router-dom";
import { BookOpen, Code, GraduationCap, Rocket, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { chapters } from "@/lib/content/chapters";

export function Home() {
  const progress = useProgressStore((s) => s.progress);
  const totalProgress = useProgressPercent();
  const completedLessons = useCompletedCount();

  const stats = [
    { icon: BookOpen, label: "课程章节", value: "9章" },
    { icon: Code, label: "实战练习", value: "18节" },
    { icon: GraduationCap, label: "学习路径", value: "3阶段" },
    { icon: Sparkles, label: "公式推导", value: "支持" },
  ];

  const nextLesson = chapters
    .flatMap((c) => c.lessons)
    .find((l) => progress[l.id] !== "completed");

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-6 h-6" />
                <span className="text-blue-100 text-sm font-medium">从零基础到LLM专家</span>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold mb-4"
            >
              开启你的大语言模型之旅
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-blue-100 mb-6 text-lg"
            >
              系统化学习路径，深入理解Transformer架构、预训练技术和工程实践。
              通过交互式公式推导和代码实验，掌握LLM的核心原理。
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4"
            >
              <Link to="/chapter/ch1" className="inline-block">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  开始学习
                </Button>
              </Link>
              <Link to="/resources" className="inline-block">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  浏览资源库
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <stat.icon className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <CardTitle>学习进度</CardTitle>
              </div>
              <Link to="/progress" className="text-sm text-blue-600 hover:underline">
                查看详情 <ChevronRight className="w-4 h-4 inline" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">已完成 {completedLessons} 节课程</span>
                <span className="text-lg font-bold text-blue-600">{totalProgress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${totalProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              {nextLesson && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-4 bg-blue-50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-600 font-medium">继续学习</div>
                      <div className="text-gray-700">
                        {nextLesson.title}
                      </div>
                    </div>
                    <Link to={`/lesson/${nextLesson.id}`} className="inline-block">
                      <Button size="sm">继续</Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">学习阶段</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "基础阶段", desc: "数学与深度学习", count: 3, icon: "1" },
                { name: "核心架构", desc: "Transformer与LLM", count: 3, icon: "2" },
                { name: "工程实践", desc: "训练与部署", count: 3, icon: "3" },
              ].map((phase, index) => (
                <motion.div
                  key={phase.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                    {phase.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{phase.name}</div>
                    <div className="text-xs text-gray-500">{phase.desc}</div>
                    <div className="text-xs text-blue-600 mt-1">{phase.count} 章课程</div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>课程大纲</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chapters.map((chapter, index) => (
                <Link to={`/chapter/${chapter.id}`} key={chapter.id} className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {chapter.order}
                      </span>
                      <span className="text-xs text-gray-500">{chapter.phase}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{chapter.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{chapter.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{chapter.lessons.length} 节课</span>
                      <span className="text-xs text-blue-600">
                        查看详情 <ChevronRight className="w-3 h-3 inline" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
