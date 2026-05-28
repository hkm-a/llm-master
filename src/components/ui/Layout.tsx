import { useEffect, useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useNavigationStore } from "@/stores/navigationStore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { SearchDialog } from "@/components/SearchDialog";

export function Layout() {
  const { sidebarCollapsed, toggleSidebar } = useNavigationStore();
  const theme = useThemeStore((s) => s.theme);
  const [searchOpen, setSearchOpen] = useState(false);

  // Apply theme on mount
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Global search shortcut
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        e.key === "/"
      ) {
        // Don't trigger if user is typing in an input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return;
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    },
    [searchOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen bg-secondary-50 dark:bg-gray-950">
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Sidebar />

      {/* Toggle button — always visible outside sidebar */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-1/2 -translate-y-1/2 z-50 w-6 h-6 bg-white border border-secondary-200 rounded-full shadow-sm flex items-center justify-center hover:bg-secondary-50 transition-all duration-300 ${
          sidebarCollapsed ? "left-3" : "left-60"
        }`}
        aria-label={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      <main
        className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? "ml-0" : "ml-64"
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
