import { useState, useCallback } from "react";
import { SidebarTabType } from "../sidebar-tabs";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { useActionStagingTracker } from "@/presentation/hooks/game/use-action-staging-tracker";
import { GameState } from "@/domain/game/game-state.schema";
import { useTurnExecution } from "./use-turn-execution";
import { useNavigationQueryState } from "../../navigation/hooks/use-navigation-query-state";

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
  _customGameId?: string,
  overrideGameState?: GameState | null,
  overrideAdvanceNextTurn?: () => Promise<GameState | null>,
) {
  const queryState = useNavigationQueryState();
  const [internalActiveTab, setInternalActiveTabState] =
    useState<SidebarTabType | null>(null);
  const [targetCodeState, setTargetCodeState] = useState<string | null>(null);
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalReports, setModalReports] = useState<CombatReport[]>([]);

  const { stagedActions, setStagedActions, clearStagedActions } =
    useActionStagingTracker();

  const [tradeDialog, setTradeDialog] = useState<TradeDialogState>({
    isOpen: false,
    resourceName: "",
    unit: "",
    mode: "buy",
    unitPrice: 100,
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

  const handleTurnComplete = useCallback(
    (reports: CombatReport[]) => {
      setModalReports(reports);
      setIsModalOpen(true);
      clearStagedActions();
    },
    [clearStagedActions],
  );

  const {
    isProcessingTurn,
    isEventModalOpen,
    activeEventData,
    setIsEventModalOpen,
    handleNextTurn,
  } = useTurnExecution(overrideAdvanceNextTurn, handleTurnComplete);

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
      const treasury = humanNation ? humanNation.treasury : 100000;
      const oilStock = humanNation ? humanNation.resources.oil : 1000;
      const steelStock = humanNation ? humanNation.resources.steel : 1000;

      const stock = name.includes("نفت") ? oilStock : steelStock;
      const maxAffordable = Math.max(1, Math.floor(treasury / (price * 1.1)));
      const maxAmount =
        mode === "buy" ? Math.min(1000, maxAffordable) : Math.max(1, stock);

      setTradeDialog({
        isOpen: true,
        resourceName: name,
        unit,
        mode,
        unitPrice: price,
        maxAmount,
      });
    },
    [humanNation],
  );

  return {
    activeTab,
    activeSubTab,
    selectedTargetCode: queryState.activeTarget || targetCodeState,
    isRailCollapsed,
    isModalOpen,
    isEventModalOpen,
    activeEventData,
    isProcessingTurn,
    modalReports,
    stagedActions,
    tradeDialog,
    humanNation,
    gameState,
    currentTurn,
    realReports: modalReports,
    setIsRailCollapsed,
    setInternalActiveTab,
    setIsModalOpen,
    setIsEventModalOpen,
    setModalReports,
    setStagedActions,
    setTradeDialog,
    handleNavigateTab,
    handleCloseActiveModal,
    handleNextTurn,
    handleOpenTrade,
  };
}
