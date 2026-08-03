import { useState, useCallback } from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { useActionStagingTracker } from "@/presentation/hooks/game/use-action-staging-tracker";
import { GameState } from "@/domain/game/game-state.schema";
import { useNavigationQueryState } from "@/presentation/components/tactical-map/navigation/hooks/use-navigation-query-state";
import { MarketEngine } from "@/engine/economy/market-engine";
import { MARKET_CONFIG } from "@/domain/economy/market.config";

export interface TradeDialogState {
  isOpen: boolean;
  resourceName: string;
  unit: string;
  mode: "buy" | "sell";
  unitPrice: number;
  maxAmount: number;
}

export function useSidebarTurnActions(
  externalActiveTab?: SidebarTabType | null,
  onClearExternalTab?: () => void,
  overrideGameState?: GameState | null,
  overrideAdvanceNextTurn?: () => Promise<GameState | null>,
) {
  const queryState = useNavigationQueryState();
  const [internalActiveTab, setInternalActiveTabState] =
    useState<SidebarTabType | null>(null);
  const [targetCodeState, setTargetCodeState] = useState<string | null>(null);
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(true);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);

  const { stagedActions } = useActionStagingTracker();

  const [tradeDialog, setTradeDialog] = useState<TradeDialogState>({
    isOpen: false,
    resourceName: "",
    unit: "",
    mode: "buy",
    unitPrice: MARKET_CONFIG.FIXED_BUY_PRICE,
    maxAmount: 100,
  });

  const gameState = overrideGameState ?? null;

  const activeTab =
    queryState.activeTab || externalActiveTab || internalActiveTab;
  const activeSubTab = queryState.activeSubTab;

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
      setInternalActiveTabState(tab);
      if (onClearExternalTab) {
        onClearExternalTab();
      }
    },
    [queryState, onClearExternalTab],
  );

  const handleNavigateTab = useCallback(
    (tab: SidebarTabType, subTab?: string, targetCode?: string) => {
      queryState.navigateToTab(tab, subTab, targetCode);
      setInternalActiveTabState(tab);
      if (targetCode) {
        setTargetCodeState(targetCode);
      }
      if (onClearExternalTab) {
        onClearExternalTab();
      }
    },
    [queryState, onClearExternalTab],
  );

  const handleCloseActiveModal = useCallback(() => {
    queryState.clearNavigation();
    setInternalActiveTabState(null);
    setTargetCodeState(null);
    if (onClearExternalTab) {
      onClearExternalTab();
    }
  }, [queryState, onClearExternalTab]);

  const handleOpenTrade = useCallback(
    (name: string, unit: string, mode: "buy" | "sell", price: number) => {
      const treasury = humanNation
        ? humanNation.treasury
        : MARKET_CONFIG.DEFAULT_TREASURY_FALLBACK;
      const isOil = name.includes("نفت");
      const stock = isOil
        ? humanNation
          ? humanNation.resources.oil
          : 0
        : humanNation
          ? humanNation.resources.steel
          : 0;

      const currentPrice =
        price && price >= 1000000 ? price : MARKET_CONFIG.FIXED_BUY_PRICE;
      const marketEngine = new MarketEngine();
      const maxAffordable = marketEngine.calculateMaxAffordable(
        treasury,
        { oil: currentPrice, steel: currentPrice },
        isOil ? "oil" : "steel",
      );

      const maxAmount = mode === "buy" ? maxAffordable : Math.max(0, stock);

      setTradeDialog({
        isOpen: true,
        resourceName: name,
        unit,
        mode,
        unitPrice: currentPrice,
        maxAmount,
      });
    },
    [humanNation],
  );

  const realReports: CombatReport[] = [];

  return {
    activeTab,
    activeSubTab,
    selectedTargetCode: queryState.activeTarget || targetCodeState,
    isRailCollapsed,
    isProcessingTurn,
    stagedActions,
    tradeDialog,
    humanNation,
    gameState,
    currentTurn,
    realReports,
    setIsRailCollapsed,
    setInternalActiveTab,
    setTradeDialog,
    handleNavigateTab,
    handleCloseActiveModal,
    handleNextTurn,
    handleOpenTrade,
  };
}
