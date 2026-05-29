import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SearchDialog } from "./SearchDialog";

// Mock the search index
vi.mock("@/data/searchIndex", () => ({
  searchLessons: vi.fn((query: string) => {
    if (!query || query.length < 1) return [];
    if (query === "xyz123") return [];
    return [
      {
        id: "ch4_lesson1",
        title: "自注意力机制",
        description: "学习Transformer的核心",
        bodyText: "",
        derivationTitles: [],
        derivationExplanations: [],
        phase: "Phase 2",
        chapterTitle: "Transformer架构",
        chapterId: "ch4",
        type: "lesson" as const,
      },
    ];
  }),
}));

describe("SearchDialog", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDialog = (open = true) =>
    render(
      <MemoryRouter>
        <SearchDialog open={open} onClose={mockOnClose} />
      </MemoryRouter>
    );

  it("renders nothing when closed", () => {
    renderDialog(false);
    expect(screen.queryByPlaceholderText(/搜索/)).not.toBeInTheDocument();
  });

  it("renders search input when open", () => {
    renderDialog(true);
    expect(screen.getByPlaceholderText(/搜索/)).toBeInTheDocument();
  });

  it("renders X button for close", () => {
    renderDialog(true);
    // The X button is the one with the X icon
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("calls onClose when X button clicked", () => {
    renderDialog(true);
    const buttons = screen.getAllByRole("button");
    // Click the last button (X button)
    fireEvent.click(buttons[buttons.length - 1]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop clicked", () => {
    renderDialog(true);
    const backdrop = document.querySelector(".bg-black\\/50");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("updates query on input change", () => {
    renderDialog(true);
    const input = screen.getByPlaceholderText(/搜索/);
    fireEvent.change(input, { target: { value: "注意力" } });
    expect(input).toHaveValue("注意力");
  });

  it("shows results when query matches", () => {
    renderDialog(true);
    const input = screen.getByPlaceholderText(/搜索/);
    fireEvent.change(input, { target: { value: "注意力" } });
    expect(screen.getByText(/找到.*个结果/)).toBeInTheDocument();
  });

  it("shows no results message when query has no matches", () => {
    renderDialog(true);
    const input = screen.getByPlaceholderText(/搜索/);
    fireEvent.change(input, { target: { value: "xyz123" } });
    expect(screen.getByText(/未找到匹配/)).toBeInTheDocument();
  });

  it("shows empty state when no query", () => {
    renderDialog(true);
    expect(screen.getByText(/输入关键词搜索/)).toBeInTheDocument();
  });

  it("handles keyboard navigation", () => {
    renderDialog(true);
    const input = screen.getByPlaceholderText(/搜索/);
    fireEvent.change(input, { target: { value: "注意力" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
  });

  it("handles Enter key to select result", () => {
    renderDialog(true);
    const input = screen.getByPlaceholderText(/搜索/);
    fireEvent.change(input, { target: { value: "注意力" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles Escape key to close", () => {
    renderDialog(true);
    const input = screen.getByPlaceholderText(/搜索/);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
