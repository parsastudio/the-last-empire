import { useCallback } from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { useUiStore } from "@/presentation/stores/use-ui-store";
import { useGameStore } from "@/presentation/stores/use-game-store";

export function useSidebarTurnActions() {
  const uiStore = useUiStore();
  const gameState = useGameStore((state) => state.gameState);
  const advanceNextTurn = useGameStore((state) => state.advanceNextTurn);

  const activeTab = uiStore.activeTab;
  const activeSubTab = uiStore.activeSubTab;
  const selectedTargetCode = uiStore.selectedTargetCode;

  const humanNation =
    gameState && gameState.humanNationId
      ? gameState.nations[gameState.humanNationId] || null
      : null;

  const currentTurn = gameState ? gameState.currentTurn : 1;

  const handleNextTurn = useCallback(async () => {
    await advanceNextTurn();
  }, [advanceNextTurn]);

  const setInternalActiveTab = useCallback(
    (tab: SidebarTabType | null) => {
      uiStore.setActiveTab(tab);
    },
    [uiStore],
  );

  const handleNavigateTab = useCallback(
    (tab: SidebarTabType, subTab?: string, targetCode?: string) => {
      uiStore.setActiveTab(tab, subTab, targetCode);
    },
    [uiStore],
  );

  const handleCloseActiveModal = useCallback(() => {
    uiStore.closeActiveTab();
  }, [uiStore]);

  return {
    activeTab,
    activeSubTab,
    selectedTargetCode,
    isRailCollapsed: uiStore.isRailCollapsed,
    isProcessingTurn: false,
    humanNation,
    gameState,
    currentTurn,
    setIsRailCollapsed: uiStore.setIsRailCollapsed,
    setInternalActiveTab,
    handleNavigateTab,
    handleCloseActiveModal,
    handleNextTurn,
  };
}
