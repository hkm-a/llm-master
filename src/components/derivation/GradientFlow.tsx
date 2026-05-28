import { memo } from "react";
import { motion } from "framer-motion";
import { FormulaDisplay } from "./FormulaDisplay";

interface GradientFlowProps {
  layers: {
    name: string;
    neurons: number;
    gradient?: number[];
  }[];
  showGradient?: boolean;
}

export const GradientFlow = memo(function GradientFlow({ layers, showGradient = true }: GradientFlowProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {layers.map((layer, index) => (
        <motion.div
          key={layer.name}
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
        >
          <div className="w-24 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
            {layer.name}
          </div>
          
          <div className="flex gap-1">
            {Array.from({ length: layer.neurons }).map((_, neuronIndex) => {
              const gradient = layer.gradient?.[neuronIndex] || 0;
              const intensity = Math.abs(gradient);
              const isPositive = gradient > 0;
              
              return (
                <motion.div
                  key={neuronIndex}
                  className="w-3 h-8 rounded-full"
                  style={{
                    backgroundColor: isPositive
                      ? `rgba(34, 197, 94, ${Math.min(intensity, 1)})`
                      : `rgba(239, 68, 68, ${Math.min(intensity, 1)})`,
                    opacity: showGradient ? 1 : 0.3,
                  }}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 + neuronIndex * 0.02 }}
                />
              );
            })}
          </div>

          {showGradient && layer.gradient && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ∇: [{layer.gradient.map((g) => g.toFixed(2)).join(", ")}]
            </div>
          )}
        </motion.div>
      ))}

      {showGradient && (
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>正梯度</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>负梯度</span>
          </div>
        </div>
      )}
    </div>
  );
});

interface BackpropStepProps {
  step: number;
  lossFormula?: string;
  gradientFormula?: string;
}

export const BackpropStep = memo(function BackpropStep({ step, lossFormula, gradientFormula }: BackpropStepProps) {
  return (
    <div className="space-y-4">
      {step >= 1 && lossFormula && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">损失函数</div>
          <FormulaDisplay formula={lossFormula} />
        </motion.div>
      )}

      {step >= 2 && gradientFormula && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">梯度计算</div>
          <FormulaDisplay formula={gradientFormula} />
        </motion.div>
      )}
    </div>
  );
});