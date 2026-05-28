import { useEffect, useRef, useState, memo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface FormulaDisplayProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const FormulaDisplay = memo(function FormulaDisplay({
  formula,
  displayMode = true,
  className = "",
}: FormulaDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(
          formula,
          containerRef.current,
          {
            displayMode,
            throwOnError: false,
          }
        );
        setRenderError(false);
      } catch {
        setRenderError(true);
      }
    }
  }, [formula, displayMode]);

  if (renderError) {
    return (
      <div className="text-sm text-red-500 dark:text-red-400 italic p-2 border border-red-200 dark:border-red-800 rounded bg-red-50 dark:bg-red-900/20">
        公式渲染失败: {formula}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${displayMode ? "overflow-x-auto" : ""} ${className}`}
    />
  );
});