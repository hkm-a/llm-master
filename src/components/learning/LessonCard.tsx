import { memo } from "react";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { LessonStatus } from "@/types";
import type { Lesson } from "@/lib/content/types";

interface LessonCardProps {
  lesson: Lesson;
  status: LessonStatus;
  onClick?: () => void;
}

type Difficulty = "easy" | "medium" | "hard";

const difficultyColors: Record<Difficulty, string> = {
  easy: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
  medium: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30",
  hard: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
};

const difficultyLabels: Record<Difficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export const LessonCard = memo(function LessonCard({ lesson, status, onClick }: LessonCardProps) {
  return (
    <Card
      variant="hover"
      className={cn(
        "cursor-pointer",
        status === "completed" && "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/20"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
              {lesson.order}
            </span>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {lesson.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                difficultyColors[lesson.difficulty]
              )}
            >
              {difficultyLabels[lesson.difficulty]}
            </span>
          </div>
        </div>

        {status === "completed" && (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}
      </div>
    </Card>
  );
});
