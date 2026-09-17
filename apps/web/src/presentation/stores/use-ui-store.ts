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

export type ModalPayload =
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
    };

export type ActiveModalState = ModalPayload | null;

interface UiStoreState {
  activeModal: ActiveModalState;
  modalStack: ModalPayload[];
  isRailCollapsed: boolean;
  openModal: (modal: ModalPayload) => void;
  openCommandCenter: (
    activeTab: SidebarTabType,
    activeSubTab?: string | null,
    selectedTargetCode?: string | null,
  ) => void;
  closeModal: () => void;
  closeAllModals: () => void;
  setIsRailCollapsed: (
    collapsed: boolean | ((prev: boolean) => boolean),
  ) => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  activeModal: null,
  modalStack: [],
  isRailCollapsed: true,

  openModal: (modal) =>
    set((state) => {
      const nextStack = [
        ...state.modalStack.filter((m) => m.type !== modal.type),
        modal,
      ];
      return {
        modalStack: nextStack,
        activeModal: modal,
      };
    }),

  openCommandCenter: (
    activeTab,
    activeSubTab = null,
    selectedTargetCode = null,
  ) => {
    const modal: ModalPayload = {
      type: "COMMAND_CENTER",
      activeTab,
      activeSubTab,
      selectedTargetCode,
    };
    set((state) => {
      const filtered = state.modalStack.filter(
        (m) => m.type !== "COMMAND_CENTER",
      );
      const nextStack = [...filtered, modal];
      return {
        modalStack: nextStack,
        activeModal: modal,
      };
    });
  },

  closeModal: () =>
    set((state) => {
      if (state.modalStack.length <= 1) {
        return {
          modalStack: [],
          activeModal: null,
        };
      }
      const nextStack = state.modalStack.slice(0, -1);
      const nextActive = nextStack[nextStack.length - 1] ?? null;
      return {
        modalStack: nextStack,
        activeModal: nextActive,
      };
    }),

  closeAllModals: () =>
    set({
      modalStack: [],
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
