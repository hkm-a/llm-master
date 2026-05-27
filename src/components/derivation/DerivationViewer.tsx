import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { StepPlayer } from "./StepPlayer";
import { FormulaDisplay } from "./FormulaDisplay";
import { MatrixVisualizer } from "./MatrixVisualizer";
import { AttentionHeatmap } from "./AttentionHeatmap";
import { GradientFlow } from "./GradientFlow";
import type { DerivationStep } from "@/types";

interface DerivationViewerProps {
  steps: DerivationStep[];
}

const mockAttentionTokens = ["我", "爱", "大", "语", "言", "模", "型"];
const mockAttentionMatrix = [
  [1.0, 0.1, 0.05, 0.02, 0.01, 0.01, 0.01],
  [0.1, 1.0, 0.2, 0.05, 0.02, 0.02, 0.01],
  [0.05, 0.2, 1.0, 0.3, 0.1, 0.05, 0.03],
  [0.02, 0.05, 0.3, 1.0, 0.4, 0.2, 0.1],
  [0.01, 0.02, 0.1, 0.4, 1.0, 0.3, 0.2],
  [0.01, 0.02, 0.05, 0.2, 0.3, 1.0, 0.4],
  [0.01, 0.01, 0.03, 0.1, 0.2, 0.4, 1.0],
];

const mockLayers = [
  { name: "输入层", neurons: 5, gradient: [0.1, 0.2, -0.1, 0.3, -0.2] },
  { name: "隐藏层1", neurons: 4, gradient: [0.4, -0.1, 0.2, -0.3] },
  { name: "隐藏层2", neurons: 3, gradient: [0.5, 0.1, -0.2] },
  { name: "输出层", neurons: 2, gradient: [0.3, -0.4] },
];

export function DerivationViewer({ steps }: DerivationViewerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const currentStepData = steps[currentStep - 1];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsAutoPlaying(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStep, isAutoPlaying, steps.length]);

  if (!currentStepData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>暂无推导步骤</p>
      </div>
    );
  }

  const renderStepContent = () => {
    if (currentStepData.formula) {
      return (
        <motion.div
          key="formula"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <FormulaDisplay formula={currentStepData.formula} />
          <p className="text-sm text-gray-600 text-center max-w-lg">
            {currentStepData.explanation}
          </p>
        </motion.div>
      );
    }

    if (currentStepData.animation?.type === "attention") {
      return (
        <motion.div
          key="attention"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <AttentionHeatmap
            attentionMatrix={mockAttentionMatrix}
            tokens={mockAttentionTokens}
            highlightToken={currentStep - 1}
          />
          <p className="text-sm text-gray-600 text-center">
            {currentStepData.explanation}
          </p>
        </motion.div>
      );
    }

    if (currentStepData.animation?.type === "matrix") {
      return (
        <motion.div
          key="matrix"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <MatrixVisualizer
            matrix={[[1, 2], [3, 4]]}
            caption="示例矩阵"
            highlightRow={0}
            cellAnimations={[{ row: 0, col: 0, type: "compute" }]}
          />
          <p className="text-sm text-gray-600 text-center">
            {currentStepData.explanation}
          </p>
        </motion.div>
      );
    }

    if (currentStepData.animation?.type === "gradient") {
      return (
        <motion.div
          key="gradient"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <GradientFlow layers={mockLayers} showGradient={true} />
          <p className="text-sm text-gray-600 text-center">
            {currentStepData.explanation}
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="default"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-gray-600">{currentStepData.explanation}</p>
      </motion.div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentStepData.title}</CardTitle>
      </CardHeader>
      <div className="py-8">
        {renderStepContent()}
      </div>
      {steps.length > 1 && (
        <div className="border-t border-gray-200 pt-4">
          <StepPlayer
            totalSteps={steps.length}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            autoPlay={isAutoPlaying}
            onAutoPlayChange={setIsAutoPlaying}
          />
        </div>
      )}
    </Card>
  );
}