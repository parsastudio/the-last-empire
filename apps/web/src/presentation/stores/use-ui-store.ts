import { create } from "zustand";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { BattleFullReportData } from "@geopolitics/domain";

export interface CoalitionAlertData {
  targetNationId: string;
  targetName: string;
  targetFlagCode: string;
  isHumanTarget: boolean;
  memberIds: string[];
  turn: number;
}

interface UiStoreState {
  activeTab: SidebarTabType | null;
  activeSubTab: string | null;
  selectedTargetCode: string | null;
  isRailCollapsed: boolean;
  selectedBattleDebrief: BattleFullReportData | null;
  selectedCoalitionAlert: CoalitionAlertData | null;
  selectedPeaceTargetCode: string | null;
  isVictoryDebriefOpen: boolean;

  setActiveTab: (
    tab: SidebarTabType | null,
    subTab?: string | null,
    targetCode?: string | null,
  ) => void;
  setIsRailCollapsed: (
    collapsed: boolean | ((prev: boolean) => boolean),
  ) => void;
  setSelectedBattleDebrief: (data: BattleFullReportData | null) => void;
  setSelectedCoalitionAlert: (data: CoalitionAlertData | null) => void;
  setSelectedPeaceTargetCode: (code: string | null) => void;
  setIsVictoryDebriefOpen: (open: boolean) => void;
  closeActiveTab: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  activeTab: null,
  activeSubTab: null,
  selectedTargetCode: null,
  isRailCollapsed: true,
  selectedBattleDebrief: null,
  selectedCoalitionAlert: null,
  selectedPeaceTargetCode: null,
  isVictoryDebriefOpen: false,

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

  setSelectedCoalitionAlert: (data) =>
    set({
      selectedCoalitionAlert: data,
    }),

  setSelectedPeaceTargetCode: (code) =>
    set({
      selectedPeaceTargetCode: code,
    }),

  setIsVictoryDebriefOpen: (open) =>
    set({
      isVictoryDebriefOpen: open,
    }),

  closeActiveTab: () =>
    set({
      activeTab: null,
      activeSubTab: null,
      selectedTargetCode: null,
    }),
}));
