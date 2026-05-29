import { useState } from "react";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import type { Quiz as QuizType } from "@/lib/content/types";

interface QuizProps {
  quiz: QuizType;
}

export function Quiz({ quiz }: QuizProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = selectedIndex === quiz.correctIndex;
  const hasAnswered = selectedIndex !== null;

  const handleSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedIndex(index);
    setShowExplanation(true);
  };

  const handleRetry = () => {
    setSelectedIndex(null);
    setShowExplanation(false);
  };

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
        🧪 {quiz.question}
      </h4>

      <div className="space-y-2">
        {quiz.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isOptionCorrect = index === quiz.correctIndex;
          const showResult = hasAnswered;

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={hasAnswered}
              className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                showResult
                  ? isOptionCorrect
                    ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
                    : isSelected && !isOptionCorrect
                      ? "bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200"
                      : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                <span>{option}</span>
                {showResult && isOptionCorrect && (
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                )}
                {showResult && isSelected && !isOptionCorrect && (
                  <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm ${
            isCorrect
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
              : "bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200"
          }`}
        >
          <p className="font-medium mb-1">{isCorrect ? "✅ 正确！" : "❌ 再想想！"}</p>
          <p>{quiz.explanation}</p>
          {!isCorrect && (
            <button
              onClick={handleRetry}
              className="mt-2 flex items-center gap-1 text-sm font-medium hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              再试一次
            </button>
          )}
        </div>
      )}
    </div>
  );
}
