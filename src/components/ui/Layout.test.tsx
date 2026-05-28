import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test, describe, beforeEach } from "vitest";
import { Layout } from "./Layout";
import { useNavigationStore } from "@/stores/navigationStore";

describe("Layout", () => {
  beforeEach(() => {
    useNavigationStore.setState({ sidebarCollapsed: false });
  });

  const renderLayout = () =>
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Layout />
      </MemoryRouter>
    );

  test("should render sidebar within layout", () => {
    renderLayout();
    expect(screen.getByText("LLM Master")).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  test("should render toggle button", () => {
    renderLayout();
    const toggleButton = screen.getByRole("button", {
      name: "折叠侧边栏",
    });
    expect(toggleButton).toBeInTheDocument();
  });

  test("toggle button should collapse sidebar on click", () => {
    renderLayout();

    const toggleButton = screen.getByRole("button", {
      name: "折叠侧边栏",
    });
    fireEvent.click(toggleButton);

    const state = useNavigationStore.getState();
    expect(state.sidebarCollapsed).toBe(true);
  });

  test("toggle button should expand sidebar on second click", () => {
    renderLayout();

    const toggleButton = screen.getByRole("button", {
      name: "折叠侧边栏",
    });
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    const state = useNavigationStore.getState();
    expect(state.sidebarCollapsed).toBe(false);
  });

  test("toggle button label changes when collapsed", () => {
    useNavigationStore.setState({ sidebarCollapsed: true });
    renderLayout();

    expect(
      screen.getByRole("button", { name: "展开侧边栏" })
    ).toBeInTheDocument();
  });

  test("main content area should have correct margin classes", () => {
    renderLayout();
    const main = document.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main?.className).toContain("ml-64");
  });

  test("main content should have ml-0 when sidebar is collapsed", () => {
    useNavigationStore.setState({ sidebarCollapsed: true });
    renderLayout();
    const main = document.querySelector("main");
    expect(main?.className).toContain("ml-0");
  });
});
