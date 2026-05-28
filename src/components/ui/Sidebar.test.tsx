import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test, describe, beforeEach } from "vitest";
import { Sidebar } from "./Sidebar";
import { useNavigationStore } from "@/stores/navigationStore";

describe("Sidebar", () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useNavigationStore.setState({ sidebarCollapsed: false });
  });

  const renderSidebar = () =>
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>
    );

  test("should render app title and subtitle", () => {
    renderSidebar();
    expect(screen.getByText("LLM Master")).toBeInTheDocument();
    expect(
      screen.getByText("大语言模型学习路径")
    ).toBeInTheDocument();
  });

  test("should render all navigation items", () => {
    renderSidebar();
    expect(screen.getByText("学习路径")).toBeInTheDocument();
    expect(screen.getByText("实验沙盒")).toBeInTheDocument();
    expect(screen.getByText("资源库")).toBeInTheDocument();
    expect(screen.getAllByText("学习进度").length).toBeGreaterThanOrEqual(1);
  });

  test("should have correct navigation links", () => {
    renderSidebar();
    const links = screen.getAllByRole("link");
    const paths = links.map((l) => l.getAttribute("href"));
    expect(paths).toContain("/");
    expect(paths).toContain("/sandbox");
    expect(paths).toContain("/resources");
    expect(paths).toContain("/progress");
  });

  test("should show progress percentage", () => {
    renderSidebar();
    // Progress should render as "N%" text
    const progressText = screen.getByText(/%/);
    expect(progressText).toBeInTheDocument();
  });

  test("should hide sidebar when collapsed", () => {
    useNavigationStore.setState({ sidebarCollapsed: true });
    renderSidebar();

    const aside = screen.getByRole("complementary");
    // When collapsed, the aside should have -translate-x-full transform
    expect(aside.className).toContain("-translate-x-full");
  });

  test("should show sidebar when not collapsed", () => {
    renderSidebar();

    const aside = screen.getByRole("complementary");
    expect(aside.className).toContain("translate-x-0");
  });
});
