import { create } from "zustand";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";

interface UiStoreState {
  activeTab: SidebarTabType | null;
  activeSubTab: string | null;
  selectedTargetCode: string | null;
  isRailCollapsed: boolean;

  setActiveTab: (
    tab: SidebarTabType | null,
    subTab?: string | null,
    targetCode?: string | null,
  ) => void;
  setIsRailCollapsed: (
    collapsed: boolean | ((prev: boolean) => boolean),
  ) => void;
  closeActiveTab: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  activeTab: null,
  activeSubTab: null,
  selectedTargetCode: null,
  isRailCollapsed: true,

  setActiveTab: (tab, subTab = null, targetCode = null) =>
    set((state) => ({
      activeTab: tab,
      activeSubTab: subTab ?? null,
      selectedTargetCode:
        targetCode !== null ? targetCode : state.selectedTargetCode,
    })),

  setIsRailCollapsed: (collapsed) =>
    set((state) => ({
      isRailCollapsed:
        typeof collapsed === "function"
          ? collapsed(state.isRailCollapsed)
          : collapsed,
    })),

  closeActiveTab: () =>
    set({
      activeTab: null,
      activeSubTab: null,
      selectedTargetCode: null,
    }),
}));
