import { create } from "zustand";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import {
  BattleFullReportData,
  ExportSalesBuyerItem,
  ExportSalesModalData,
} from "@geopolitics/domain";

export type { ExportSalesBuyerItem, ExportSalesModalData };

export interface CoalitionAlertData {
  targetNationId: string;
  targetName: string;
  targetFlagCode: string;
  isHumanTarget: boolean;
  memberIds: string[];
  turn: number;
}

export type ActiveModalState =
  | {
      type: "COMMAND_CENTER";
      activeTab: SidebarTabType;
      activeSubTab?: string | null;
      selectedTargetCode?: string | null;
    }
  | {
      type: "DIRECT_ATTACK";
      targetNationId: string;
      targetProvinceId?: number | null;
    }
  | {
      type: "PEACE_NEGOTIATION";
      targetNationId: string;
    }
  | {
      type: "BATTLE_DEBRIEF";
      reportData: BattleFullReportData;
    }
  | {
      type: "COALITION_ALERT";
      data: CoalitionAlertData;
    }
  | {
      type: "EXPORT_SALES";
      data: ExportSalesModalData;
    }
  | {
      type: "VICTORY_DEBRIEF";
    }
  | null;

interface UiStoreState {
  activeModal: ActiveModalState;
  isRailCollapsed: boolean;
  openModal: (modal: NonNullable<ActiveModalState>) => void;
  openCommandCenter: (
    activeTab: SidebarTabType,
    activeSubTab?: string | null,
    selectedTargetCode?: string | null,
  ) => void;
  closeModal: () => void;
  setIsRailCollapsed: (
    collapsed: boolean | ((prev: boolean) => boolean),
  ) => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  activeModal: null,
  isRailCollapsed: true,

  openModal: (modal) =>
    set({
      activeModal: modal,
    }),

  openCommandCenter: (
    activeTab,
    activeSubTab = null,
    selectedTargetCode = null,
  ) =>
    set({
      activeModal: {
        type: "COMMAND_CENTER",
        activeTab,
        activeSubTab,
        selectedTargetCode,
      },
    }),

  closeModal: () =>
    set({
      activeModal: null,
    }),

  setIsRailCollapsed: (collapsed) =>
    set((state) => ({
      isRailCollapsed:
        typeof collapsed === "function"
          ? collapsed(state.isRailCollapsed)
          : collapsed,
    })),
}));
