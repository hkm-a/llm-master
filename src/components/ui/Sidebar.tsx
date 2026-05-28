import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  Code,
  FolderOpen,
  BarChart3,
  GraduationCap,
  Moon,
  Sun,
} from "lucide-react";
import { useNavigationStore } from "@/stores/navigationStore";
import { useProgressPercent } from "@/stores/progressStore";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { path: "/", label: "学习路径", icon: BookOpen },
  { path: "/sandbox", label: "实验沙盒", icon: Code },
  { path: "/resources", label: "资源库", icon: FolderOpen },
  { path: "/progress", label: "学习进度", icon: BarChart3 },
];

export function Sidebar() {
  const { sidebarCollapsed } = useNavigationStore();
  const progress = useProgressPercent();
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-secondary-200 dark:border-gray-700 transition-transform duration-300 z-50 ${
        sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-secondary-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <div>
              <h1 className="text-lg font-bold text-secondary-900 dark:text-white">
                LLM Master
              </h1>
              <p className="text-xs text-secondary-500 dark:text-gray-400">大语言模型学习路径</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "sidebar-item",
                  isActive && "active",
                  !isActive &&
                    location.pathname.startsWith(item.path) &&
                    item.path !== "/" &&
                    "active"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-secondary-200 dark:border-gray-700">
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-secondary-600 dark:text-gray-400">学习进度</span>
              <span className="text-primary-600 dark:text-primary-400 font-medium">{progress}%</span>
            </div>
            <div className="progress-bar dark:bg-gray-700">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="mt-3 flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-secondary-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={theme === "dark" ? "切换亮色模式" : "切换深色模式"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            <span>{theme === "dark" ? "亮色模式" : "深色模式"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
