import { NavLink } from "react-router-dom";
import { ChevronRight, Book, Brain, Wrench } from "lucide-react";
import { getChaptersByPhase } from "@/lib/content/chapters";
import { cn } from "@/components/ui/Button";

const phaseIcons: Record<string, typeof Book> = {
  "Phase 1: 基础": Book,
  "Phase 2: 核心架构": Brain,
  "Phase 3: 工程实践": Wrench,
};

const phaseLabels: Record<string, string> = {
  "Phase 1: 基础": "基础阶段",
  "Phase 2: 核心架构": "核心架构",
  "Phase 3: 工程实践": "工程实践",
};

const phases = ["Phase 1: 基础", "Phase 2: 核心架构", "Phase 3: 工程实践"] as const;

export function ChapterNav() {

  return (
    <div className="space-y-6">
      {phases.map((phase) => {
        const IconComponent = phaseIcons[phase];
        return (
          <div key={phase}>
            <div className="flex items-center gap-2 mb-3">
              <IconComponent className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-700">
                {phaseLabels[phase]}
              </h2>
            </div>

          <div className="space-y-1">
            {getChaptersByPhase(phase).map((chapter) => (
              <NavLink
                key={chapter.id}
                to={`/chapter/${chapter.id}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                      : "hover:bg-gray-50 text-gray-600"
                  )
                }
              >
                <span className="text-xs font-mono text-gray-400">
                  {chapter.order}
                </span>
                <span className="flex-1">{chapter.title}</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </NavLink>
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
}
