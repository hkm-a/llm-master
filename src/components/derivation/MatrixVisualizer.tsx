import { motion } from "framer-motion";

interface MatrixVisualizerProps {
  matrix: number[][];
  highlightRow?: number;
  highlightCol?: number;
  cellAnimations?: { row: number; col: number; type: "compute" | "result" }[];
  caption?: string;
}

export function MatrixVisualizer({
  matrix,
  highlightRow,
  highlightCol,
  cellAnimations = [],
  caption,
}: MatrixVisualizerProps) {
  const getCellClass = (row: number, col: number) => {
    const isHighlighted = highlightRow === row || highlightCol === col;
    const anim = cellAnimations.find(
      (a) => a.row === row && a.col === col
    );
    
    let className = "px-3 py-2 text-center border border-gray-300 transition-all duration-300";
    
    if (anim?.type === "compute") {
      className += " bg-yellow-100 animate-pulse";
    } else if (anim?.type === "result") {
      className += " bg-green-100";
    } else if (isHighlighted) {
      className += " bg-blue-50";
    } else {
      className += " bg-white";
    }
    
    return className;
  };

  return (
    <div className="inline-block">
      {caption && (
        <div className="text-sm text-gray-600 mb-2 text-center">{caption}</div>
      )}
      <div className="border-2 border-gray-400 rounded-lg overflow-hidden shadow-sm">
        {matrix.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            className="flex"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rowIndex * 0.1 }}
          >
            {row.map((cell, colIndex) => (
              <motion.div
                key={colIndex}
                className={getCellClass(rowIndex, colIndex)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: rowIndex * 0.1 + colIndex * 0.05 }}
              >
                {cell}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}