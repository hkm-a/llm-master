import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, describe, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

describe("ErrorBoundary", () => {
  test("should render children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  test("should show error UI when child throws", () => {
    const Thrower = () => {
      throw new Error("Test error message");
    };

    // Suppress console.error from React error logging
    const origError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );

    expect(screen.getByText("出错了")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();

    console.error = origError;
  });

  test("should show custom fallback when provided", () => {
    const Thrower = () => {
      throw new Error("boom");
    };

    const origError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <Thrower />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
    expect(screen.queryByText("出错了")).not.toBeInTheDocument();

    console.error = origError;
  });

  test("reset button should restore children", () => {
    let shouldThrow = true;
    const ConditionalThrower = () => {
      if (shouldThrow) {
        throw new Error("oops");
      }
      return <div>Recovered content</div>;
    };

    const origError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>
    );

    expect(screen.getByText("出错了")).toBeInTheDocument();

    // Reset
    shouldThrow = false;
    fireEvent.click(screen.getByText("重试"));

    expect(screen.getByText("Recovered content")).toBeInTheDocument();

    console.error = origError;
  });

  test("should expand error details on click", () => {
    const Thrower = () => {
      throw new Error("Detail message");
    };

    const origError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );

    // Error detail is in a <details> element, initially collapsed
    const details = screen.getByText("错误详情").closest("details");
    expect(details).toBeInTheDocument();
    expect(details).not.toHaveAttribute("open");

    console.error = origError;
  });
});
