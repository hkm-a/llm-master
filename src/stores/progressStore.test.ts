import { expect, test, describe, beforeEach } from "vitest";
import {
  useProgressStore,
  useProgressPercent,
  useCompletedCount,
  useInProgressCount,
  useTotalCount,
  useLessonStatus,
  useChapterCompletedCount,
  useChapterProgressPercent,
  calculateTotalProgress,
} from "./progressStore";
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

  test("should reset progress", () => {
    act(() => {
      useProgressStore.getState().updateLessonProgress("ch1_lesson1", "completed");
    });

    act(() => {
      useProgressStore.getState().resetProgress();
    });

    const { result } = renderHook(() => useProgressStore());
    expect(result.current.progress.ch1_lesson1).toBe("not_started");
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

  test("should count completed lessons", () => {
    act(() => {
      useProgressStore.getState().updateLessonProgress("ch1_lesson1", "completed");
      useProgressStore.getState().updateLessonProgress("ch1_lesson2", "completed");
    });

    const { result } = renderHook(() => useCompletedCount());
    expect(result.current).toBe(2);
  });

  test("should count in-progress lessons", () => {
    act(() => {
      useProgressStore.getState().updateLessonProgress("ch1_lesson1", "in_progress");
    });

    const { result } = renderHook(() => useInProgressCount());
    expect(result.current).toBe(1);
  });

  test("should count total lessons", () => {
    const { result } = renderHook(() => useTotalCount());
    expect(result.current).toBe(3);
  });

  test("should get lesson status", () => {
    act(() => {
      useProgressStore.getState().updateLessonProgress("ch1_lesson1", "completed");
    });

    const { result } = renderHook(() => useLessonStatus("ch1_lesson1"));
    expect(result.current).toBe("completed");
  });

  test("should return not_started for unknown lesson", () => {
    const { result } = renderHook(() => useLessonStatus("unknown_lesson"));
    expect(result.current).toBe("not_started");
  });

  test("should count completed lessons in chapter", () => {
    act(() => {
      useProgressStore.getState().updateLessonProgress("ch1_lesson1", "completed");
    });

    const { result } = renderHook(() => useChapterCompletedCount("ch1"));
    expect(result.current).toBe(1);
  });

  test("should calculate chapter progress percent", () => {
    act(() => {
      useProgressStore.getState().updateLessonProgress("ch1_lesson1", "completed");
    });

    const { result } = renderHook(() => useChapterProgressPercent("ch1"));
    expect(result.current).toBeGreaterThanOrEqual(0);
    expect(result.current).toBeLessThanOrEqual(100);
  });

  test("should return 0 for unknown chapter", () => {
    const { result } = renderHook(() => useChapterCompletedCount("unknown"));
    expect(result.current).toBe(0);
  });

  test("should return 0 percent for unknown chapter", () => {
    const { result } = renderHook(() => useChapterProgressPercent("unknown"));
    expect(result.current).toBe(0);
  });

  test("should calculate 100% when all lessons completed", () => {
    act(() => {
      useProgressStore.getState().updateLessonProgress("ch1_lesson1", "completed");
      useProgressStore.getState().updateLessonProgress("ch1_lesson2", "completed");
      useProgressStore.getState().updateLessonProgress("ch2_lesson1", "completed");
    });

    const { result } = renderHook(() => useProgressPercent());
    expect(result.current).toBe(100);
  });

  test("should calculate 0% when no lessons completed", () => {
    const { result } = renderHook(() => useProgressPercent());
    expect(result.current).toBe(0);
  });
});
