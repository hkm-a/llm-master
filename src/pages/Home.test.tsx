import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "./Home";

describe("Home", () => {
  const renderHome = () =>
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

  it("renders the hero heading", () => {
    renderHome();
    expect(screen.getByText("开启你的大语言模型之旅")).toBeInTheDocument();
  });

  it("renders the stats section with dynamic chapter count", () => {
    renderHome();
    expect(screen.getByText("9章")).toBeInTheDocument();
    expect(screen.getByText("18节")).toBeInTheDocument();
    expect(screen.getByText("3阶段")).toBeInTheDocument();
  });

  it("renders the start learning button", () => {
    renderHome();
    expect(screen.getByText("开始学习")).toBeInTheDocument();
  });

  it("renders the resources button", () => {
    renderHome();
    expect(screen.getByText("浏览资源库")).toBeInTheDocument();
  });

  it("renders the course outline section", () => {
    renderHome();
    expect(screen.getByText("课程大纲")).toBeInTheDocument();
  });

  it("renders the learning progress section", () => {
    renderHome();
    expect(screen.getByText("学习进度")).toBeInTheDocument();
  });

  it("renders the learning phases section", () => {
    renderHome();
    expect(screen.getByText("学习阶段")).toBeInTheDocument();
  });
});
