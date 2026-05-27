import { motion } from "framer-motion";

interface AttentionHeatmapProps {
  attentionMatrix: number[][];
  tokens: string[];
  highlightToken?: number;
}

function getHeatColor(value: number): string {
  return `rgba(59, 130, 246, ${0.3 + value * 0.7})`;
}

export function AttentionHeatmap({
  attentionMatrix,
  tokens,
  highlightToken,
}: AttentionHeatmapProps) {
  return (
    <div className="overflow-x-auto">
      <div className="relative inline-block">
        <div className="absolute -left-16 top-0 flex flex-col">
          {tokens.map((token, i) => (
            <div
              key={i}
              className="h-8 flex items-center justify-end pr-2 text-xs text-gray-600"
              style={{ height: "32px" }}
            >
              {token.slice(0, 10)}
            </div>
          ))}
        </div>

        <div className="ml-16">
          <div className="flex mb-1">
            <div className="w-16" />
            {tokens.map((token, i) => (
              <div
                key={i}
                className="w-8 text-center text-xs text-gray-600"
                style={{ width: "32px" }}
              >
                {token.slice(0, 5)}
              </div>
            ))}
          </div>

          {attentionMatrix.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              className="flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rowIndex * 0.1 }}
            >
              {row.map((value, colIndex) => {
                const isHighlighted =
                  highlightToken === rowIndex || highlightToken === colIndex;
                return (
                  <motion.div
                    key={colIndex}
                    className="border border-gray-200 flex items-center justify-center text-xs font-medium"
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: getHeatColor(value),
                      borderWidth: isHighlighted ? "2px" : "1px",
                      borderColor: isHighlighted ? "#2563eb" : "#e5e7eb",
                    }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: rowIndex * 0.1 + colIndex * 0.05 }}
                  >
                    {Math.round(value * 100)}%
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}