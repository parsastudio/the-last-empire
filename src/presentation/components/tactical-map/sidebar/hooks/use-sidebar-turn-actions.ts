import { useState, useCallback } from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { GameState } from "@/domain/game/game-state.schema";
import { useNavigationQueryState } from "@/presentation/components/tactical-map/navigation/hooks/use-navigation-query-state";

export function useSidebarTurnActions(
  externalActiveTab?: SidebarTabType | null,
  onClearExternalTab?: () => void,
  overrideGameState?: GameState | null,
  overrideAdvanceNextTurn?: () => Promise<GameState | null>,
) {
  const queryState = useNavigationQueryState();
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(true);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);

  const gameState = overrideGameState ?? null;

  const activeTab = externalActiveTab ?? queryState.activeTab;
  const activeSubTab = queryState.activeSubTab;
  const selectedTargetCode = queryState.activeTarget;

  const humanNation =
    gameState && gameState.humanNationId
      ? gameState.nations[gameState.humanNationId] || null
      : null;

  const currentTurn = gameState ? gameState.currentTurn : 1;

  const handleNextTurn = useCallback(async () => {
    if (isProcessingTurn || !overrideAdvanceNextTurn) return;

    try {
      setIsProcessingTurn(true);
      await overrideAdvanceNextTurn();
    } finally {
      setIsProcessingTurn(false);
    }
  }, [isProcessingTurn, overrideAdvanceNextTurn]);

  const setInternalActiveTab = useCallback(
    (tab: SidebarTabType | null) => {
      if (tab) {
        queryState.navigateToTab(tab);
      } else {
        queryState.clearNavigation();
      }
      if (onClearExternalTab) {
        onClearExternalTab();
      }
    },
    [queryState, onClearExternalTab],
  );

  const handleNavigateTab = useCallback(
    (tab: SidebarTabType, subTab?: string, targetCode?: string) => {
      queryState.navigateToTab(tab, subTab, targetCode);
      if (onClearExternalTab) {
        onClearExternalTab();
      }
    },
    [queryState, onClearExternalTab],
  );

  const handleCloseActiveModal = useCallback(() => {
    queryState.clearNavigation();
    if (onClearExternalTab) {
      onClearExternalTab();
    }
  }, [queryState, onClearExternalTab]);

  return {
    activeTab,
    activeSubTab,
    selectedTargetCode,
    isRailCollapsed,
    isProcessingTurn,
    humanNation,
    gameState,
    currentTurn,
    setIsRailCollapsed,
    setInternalActiveTab,
    handleNavigateTab,
    handleCloseActiveModal,
    handleNextTurn,
  };
}
