import { useCallback } from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { GameState } from "@/domain/game/game-state.schema";
import { useUiStore } from "@/presentation/stores/use-ui-store";

export function useSidebarTurnActions(
  externalActiveTab?: SidebarTabType | null,
  onClearExternalTab?: () => void,
  overrideGameState?: GameState | null,
  overrideAdvanceNextTurn?: () => Promise<GameState | null>,
) {
  const uiStore = useUiStore();

  const gameState = overrideGameState ?? null;

  const activeTab = externalActiveTab ?? uiStore.activeTab;
  const activeSubTab = uiStore.activeSubTab;
  const selectedTargetCode = uiStore.selectedTargetCode;

  const humanNation =
    gameState && gameState.humanNationId
      ? gameState.nations[gameState.humanNationId] || null
      : null;

  const currentTurn = gameState ? gameState.currentTurn : 1;

  const handleNextTurn = useCallback(async () => {
    if (!overrideAdvanceNextTurn) return;
    await overrideAdvanceNextTurn();
  }, [overrideAdvanceNextTurn]);

  const setInternalActiveTab = useCallback(
    (tab: SidebarTabType | null) => {
      uiStore.setActiveTab(tab);
      if (onClearExternalTab) {
        onClearExternalTab();
      }
    },
    [uiStore, onClearExternalTab],
  );

  const handleNavigateTab = useCallback(
    (tab: SidebarTabType, subTab?: string, targetCode?: string) => {
      uiStore.setActiveTab(tab, subTab, targetCode);
      if (onClearExternalTab) {
        onClearExternalTab();
      }
    },
    [uiStore, onClearExternalTab],
  );

  const handleCloseActiveModal = useCallback(() => {
    uiStore.closeActiveTab();
    if (onClearExternalTab) {
      onClearExternalTab();
    }
  }, [uiStore, onClearExternalTab]);

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
