import { create } from "zustand";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { BattleFullReportData } from "@geopolitics/domain";

interface UiStoreState {
  activeTab: SidebarTabType | null;
  activeSubTab: string | null;
  selectedTargetCode: string | null;
  isRailCollapsed: boolean;
  selectedBattleDebrief: BattleFullReportData | null;

  setActiveTab: (
    tab: SidebarTabType | null,
    subTab?: string | null,
    targetCode?: string | null,
  ) => void;
  setIsRailCollapsed: (
    collapsed: boolean | ((prev: boolean) => boolean),
  ) => void;
  setSelectedBattleDebrief: (data: BattleFullReportData | null) => void;
  closeActiveTab: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  activeTab: null,
  activeSubTab: null,
  selectedTargetCode: null,
  isRailCollapsed: true,
  selectedBattleDebrief: null,

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

  setSelectedBattleDebrief: (data) =>
    set({
      selectedBattleDebrief: data,
    }),

  closeActiveTab: () =>
    set({
      activeTab: null,
      activeSubTab: null,
      selectedTargetCode: null,
    }),
}));
