import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

interface StepPlayerProps {
  totalSteps: number;
  currentStep: number;
  onStepChange: (step: number) => void;
  autoPlay?: boolean;
  onAutoPlayChange?: (playing: boolean) => void;
}

export function StepPlayer({
  totalSteps,
  currentStep,
  onStepChange,
  autoPlay = false,
  onAutoPlayChange,
}: StepPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);

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
    const newState = !isPlaying;
    setIsPlaying(newState);
    onAutoPlayChange?.(newState);
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
              index + 1 <= currentStep ? "bg-blue-600" : "bg-gray-300"
            }`}
            onClick={() => onStepChange(index + 1)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleNext}
        disabled={currentStep === totalSteps}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      <span className="text-sm text-gray-600">
        {currentStep} / {totalSteps}
      </span>
    </div>
  );
}