import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "./themeStore";

describe("themeStore", () => {
  beforeEach(() => {
    // Reset store state
    useThemeStore.setState({ theme: "light" });
    // Clear localStorage
    localStorage.clear();
    // Mock document.documentElement.classList
    document.documentElement.classList.remove("dark");
  });

  it("has default theme", () => {
    const { theme } = useThemeStore.getState();
    expect(["light", "dark"]).toContain(theme);
  });

  it("toggles theme from light to dark", () => {
    useThemeStore.setState({ theme: "light" });
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("toggles theme from dark to light", () => {
    useThemeStore.setState({ theme: "dark" });
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("sets theme directly", () => {
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("sets theme to light", () => {
    useThemeStore.getState().setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("adds dark class to document when theme is dark", () => {
    useThemeStore.getState().setTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class from document when theme is light", () => {
    document.documentElement.classList.add("dark");
    useThemeStore.getState().setTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
