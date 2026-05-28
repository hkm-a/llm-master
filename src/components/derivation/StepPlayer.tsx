import { motion } from "framer-motion";
import { memo } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "../ui/Button";

interface StepPlayerProps {
  totalSteps: number;
  currentStep: number;
  onStepChange: (step: number) => void;
  autoPlay?: boolean;
  onAutoPlayChange?: (playing: boolean) => void;
}

/**
 * Step navigation player for derivation visualizations.
 *
 * Uses `autoPlay` as the single source of truth for play state.
 * The parent (DerivationViewer) owns the playing state via `isAutoPlaying`;
 * this component only reflects + notifies changes.
 */
export const StepPlayer = memo(function StepPlayer({
  totalSteps,
  currentStep,
  onStepChange,
  autoPlay = false,
  onAutoPlayChange,
}: StepPlayerProps) {
  const handlePrev = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      onStepChange(currentStep + 1);
    }
  };

  const togglePlay = () => {
    onAutoPlayChange?.(!autoPlay);
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="secondary"
        size="sm"
        onClick={handlePrev}
        disabled={currentStep === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index + 1 <= currentStep ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
            onClick={() => onStepChange(index + 1)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`第 ${index + 1} 步`}
            role="tab"
            aria-selected={index + 1 === currentStep}
          />
        ))}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={togglePlay}
      >
        {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleNext}
        disabled={currentStep === totalSteps}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      <span className="text-sm text-gray-600 dark:text-gray-400">
        {currentStep} / {totalSteps}
      </span>
    </div>
  );
});