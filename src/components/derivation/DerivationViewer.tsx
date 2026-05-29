import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { StepPlayer } from "./StepPlayer";
import { FormulaDisplay } from "./FormulaDisplay";
import { MatrixVisualizer } from "./MatrixVisualizer";
import { AttentionHeatmap } from "./AttentionHeatmap";
import { GradientFlow } from "./GradientFlow";
import { VideoPlayer } from "./VideoPlayer";
import {
  deriveAttentionData,
  deriveMatrixData,
  deriveGradientData,
  deriveVideoData,
} from "@/lib/utils/visualization";
import type { DerivationStep } from "@/types";

interface DerivationViewerProps {
  steps: DerivationStep[];
}

export function DerivationViewer({ steps }: DerivationViewerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const currentStepData = steps[currentStep - 1];

  const attentionData = useMemo(
    () => (currentStepData ? deriveAttentionData(currentStepData) : null),
    [currentStepData]
  );
  const matrixData = useMemo(
    () => (currentStepData ? deriveMatrixData(currentStepData) : null),
    [currentStepData]
  );
  const gradientData = useMemo(
    () => (currentStepData ? deriveGradientData(currentStepData) : null),
    [currentStepData]
  );
  const videoData = useMemo(
    () => (currentStepData ? deriveVideoData(currentStepData) : null),
    [currentStepData]
  );

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
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>暂无推导步骤</p>
      </div>
    );
  }

  const renderStepContent = () => {
    if (currentStepData.formula && !currentStepData.animation) {
      return (
        <motion.div
          key="formula"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <FormulaDisplay formula={currentStepData.formula} />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-lg">
            {currentStepData.explanation}
          </p>
        </motion.div>
      );
    }

    if (attentionData) {
      return (
        <motion.div
          key="attention"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <AttentionHeatmap
            attentionMatrix={attentionData.matrix}
            tokens={attentionData.tokens}
            highlightToken={currentStep - 1}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {currentStepData.explanation}
          </p>
        </motion.div>
      );
    }

    if (matrixData) {
      return (
        <motion.div
          key="matrix"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <MatrixVisualizer
            matrix={matrixData.matrix}
            caption={matrixData.caption}
            highlightRow={0}
            cellAnimations={[{ row: 0, col: 0, type: "compute" }]}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {currentStepData.explanation}
          </p>
        </motion.div>
      );
    }

    if (videoData) {
      return (
        <motion.div
          key="video"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <VideoPlayer src={videoData.videoPath} caption={videoData.caption} />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-lg">
            {currentStepData.explanation}
          </p>
        </motion.div>
      );
    }

    if (gradientData) {
      return (
        <motion.div
          key="gradient"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <GradientFlow layers={gradientData.layers} showGradient={true} />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {currentStepData.explanation}
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-gray-600 dark:text-gray-400">{currentStepData.explanation}</p>
      </motion.div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentStepData.title}</CardTitle>
      </CardHeader>
      <div className="py-8">{renderStepContent()}</div>
      {steps.length > 1 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
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
