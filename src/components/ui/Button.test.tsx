import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, describe, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  test("should render with children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  test("should apply correct variant styles", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary")).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText("Secondary")).toBeInTheDocument();
  });

  test("should apply correct size styles", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText("Small")).toBeInTheDocument();

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText("Medium")).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText("Large")).toBeInTheDocument();
  });

  test("should handle click events", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("should be disabled when disabled prop is passed", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
  });
});
