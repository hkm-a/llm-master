import { render, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

describe("Card", () => {
  test("should render Card component", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  test("should render Card with header and title", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText("Card Title")).toBeInTheDocument();
  });

  test("should render Card with content", () => {
    render(
      <Card>
        <CardContent>Main content here</CardContent>
      </Card>
    );
    expect(screen.getByText("Main content here")).toBeInTheDocument();
  });

  test("should render full card structure", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>Test Content</CardContent>
      </Card>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
