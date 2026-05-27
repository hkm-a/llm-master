import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/Button";
import type { LessonStatus } from "@/types";
import type { Lesson } from "@/lib/content/types";

interface LessonCardProps {
  lesson: Lesson;
  status: LessonStatus;
  onClick?: () => void;
}

type Difficulty = "easy" | "medium" | "hard";

const difficultyColors: Record<Difficulty, string> = {
  easy: "text-green-600 bg-green-50",
  medium: "text-yellow-600 bg-yellow-50",
  hard: "text-red-600 bg-red-50",
};

const difficultyLabels: Record<Difficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export function LessonCard({ lesson, status, onClick }: LessonCardProps) {
  return (
    <Card
      variant="hover"
      className={cn(
        "cursor-pointer",
        status === "completed" && "border-green-200 bg-green-50/30"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">
              {lesson.order}
            </span>
            <h4 className="text-sm font-medium text-gray-900">
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
}
