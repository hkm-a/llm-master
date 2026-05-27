import { expect, test, describe, beforeEach } from "vitest";
import { useProgressStore, useProgressPercent, calculateTotalProgress } from "./progressStore";
import { act, renderHook } from "@testing-library/react";

describe("progressStore", () => {
  beforeEach(() => {
    useProgressStore.setState({
      progress: {
        ch1_lesson1: "not_started",
        ch1_lesson2: "not_started",
        ch2_lesson1: "not_started",
      },
    });
  });

  test("should initialize with default progress", () => {
    const { result } = renderHook(() => useProgressStore());
    expect(result.current.progress).toBeDefined();
  });

  test("should update lesson progress", () => {
    const { result } = renderHook(() => useProgressStore());
    
    act(() => {
      result.current.updateLessonProgress("ch1_lesson1", "in_progress");
    });

    expect(result.current.progress.ch1_lesson1).toBe("in_progress");
  });

  test("should calculate total progress via hook", () => {
    act(() => {
      useProgressStore.getState().updateLessonProgress("ch1_lesson1", "completed");
    });

    const { result } = renderHook(() => useProgressPercent());
    expect(result.current).toBeGreaterThanOrEqual(0);
    expect(result.current).toBeLessThanOrEqual(100);
  });

  test("should calculate total progress via helper", () => {
    act(() => {
      useProgressStore.getState().updateLessonProgress("ch1_lesson1", "completed");
    });

    const progress = useProgressStore.getState().progress;
    const totalProgress = calculateTotalProgress(progress);
    expect(totalProgress).toBeGreaterThanOrEqual(0);
    expect(totalProgress).toBeLessThanOrEqual(100);
  });
});
