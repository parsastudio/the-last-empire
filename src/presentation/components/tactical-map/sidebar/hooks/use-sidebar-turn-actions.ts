import { useState, useCallback } from "react";
import { SidebarTabType } from "../sidebar-tabs";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { useToast } from "@/presentation/context/toast-context";
import { useGeopoliticsGame } from "@/presentation/hooks/game/use-geopolitics-game";
import { useActionStagingTracker } from "@/presentation/hooks/game/use-action-staging-tracker";

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
  customGameId?: string,
) {
  const [internalActiveTab, setInternalActiveTab] =
    useState<SidebarTabType | null>(null);
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
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

  const { showToast } = useToast();
  const { gameState, advanceNextTurn } = useGeopoliticsGame(customGameId);

  const activeTab = externalActiveTab || internalActiveTab;
  const humanNation =
    gameState && gameState.humanNationId
      ? gameState.nations[gameState.humanNationId] || null
      : null;

  const currentTurn = gameState ? gameState.currentTurn : 1;

  const handleCloseActiveModal = useCallback(() => {
    setInternalActiveTab(null);
    if (onClearExternalTab) {
      onClearExternalTab();
    }
  }, [onClearExternalTab]);

  const handleNextTurn = async () => {
    if (isProcessingTurn) return;

    try {
      setIsProcessingTurn(true);
      const nextState = await advanceNextTurn();
      const reportsSource = nextState || gameState;

      const combatLogs = reportsSource?.turnLogs
        ? reportsSource.turnLogs.filter((log) => log.level === "COMBAT")
        : [];

      const realReports: CombatReport[] = combatLogs.map((log) => {
        const meta = log.metadata || {};
        const attackerLost =
          typeof meta.attackerLost === "number" ? meta.attackerLost : 10;
        const defenderLost =
          typeof meta.defenderLost === "number" ? meta.defenderLost : 35;
        const attackerRetreated =
          typeof meta.attackerRetreated === "number"
            ? meta.attackerRetreated
            : 0;
        const defenderRetreated =
          typeof meta.defenderRetreated === "number"
            ? meta.defenderRetreated
            : 0;
        const conqueredAreaSqKm =
          typeof meta.conqueredAreaSqKm === "number"
            ? meta.conqueredAreaSqKm
            : 12500;
        const isVictory =
          typeof meta.isVictory === "boolean" ? meta.isVictory : true;

        return {
          id: log.id,
          turn: log.turn,
          timestamp: log.timestamp,
          severity: isVictory ? "VICTORY" : "DEFEAT",
          title: `گزارش عملیاتی نوبت ${log.turn}`,
          summary: log.message,
          attackerNationId: log.sourceNationId,
          attackerName:
            reportsSource?.nations[log.sourceNationId]?.name ||
            log.sourceNationId,
          defenderNationId: log.targetNationId || "DEFENDER",
          defenderName: log.targetNationId
            ? reportsSource?.nations[log.targetNationId]?.name ||
              log.targetNationId
            : "دشمن",
          attackerCasualties: {
            infantryEngaged: attackerLost + attackerRetreated + 10,
            infantryLost: attackerLost,
            infantryRetreated: attackerRetreated,
            airForceEngaged: 10,
            airForceLost: Math.min(5, Math.floor(attackerLost * 0.1)),
            droneMissileEngaged: 5,
            droneMissileLost: 0,
          },
          defenderCasualties: {
            infantryEngaged: defenderLost + defenderRetreated + 20,
            infantryLost: defenderLost,
            infantryRetreated: defenderRetreated,
            airForceEngaged: 10,
            airForceLost: Math.min(10, Math.floor(defenderLost * 0.1)),
            droneMissileEngaged: 0,
            droneMissileLost: 0,
          },
          conqueredAreaSqKm,
          capitulatedAreaSqKm: 0,
          strategicAssessment: isVictory
            ? "ارزیابی ستاد کل: عملیات با تثبیت خطوط نبرد همراه بود."
            : "ارزیابی ستاد کل: عقب‌نشینی تاکتیکی جهت تجدید قوا.",
          isVictory,
        };
      });

      setModalReports(realReports);
      setIsModalOpen(true);
      clearStagedActions();

      showToast(
        "نوبت جدید آغاز شد",
        `محاسبات نوبت ${nextState ? nextState.currentTurn : currentTurn + 1} با موفقیت انجام شد.`,
        "info",
      );

      if (currentTurn % 3 === 0) {
        setTimeout(() => {
          setIsEventModalOpen(true);
        }, 500);
      }
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const handleOpenTrade = (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => {
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
  };

  return {
    activeTab,
    isRailCollapsed,
    isModalOpen,
    isEventModalOpen,
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
    handleCloseActiveModal,
    handleNextTurn,
    handleOpenTrade,
  };
}
