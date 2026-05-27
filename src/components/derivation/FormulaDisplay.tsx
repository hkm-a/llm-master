import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface FormulaDisplayProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export function FormulaDisplay({
  formula,
  displayMode = true,
  className = "",
}: FormulaDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
      } catch (error) {
        console.error("KaTeX rendering error:", error);
      }
    }
  }, [formula, displayMode]);

  return (
    <div
      ref={containerRef}
      className={`${displayMode ? "overflow-x-auto" : ""} ${className}`}
    />
  );
}