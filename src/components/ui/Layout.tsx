import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useNavigationStore } from "@/stores/navigationStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Layout() {
  const { sidebarCollapsed, toggleSidebar } = useNavigationStore();

  return (
    <div className="flex h-screen bg-secondary-50">
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
