import { create } from "zustand";

interface NavigationStore {
  currentPath: string;
  sidebarCollapsed: boolean;
  setCurrentPath: (path: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  currentPath: "/",
  sidebarCollapsed: false,

  setCurrentPath: (path) => set({ currentPath: path }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));