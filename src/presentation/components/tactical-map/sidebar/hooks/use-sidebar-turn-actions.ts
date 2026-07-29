import { useState, useCallback } from "react";
import { SidebarTabType } from "../sidebar-tabs";
import {
  CombatReport,
  ReportSeverity,
} from "@/domain/reports/combat-report.schema";
import { useToast } from "@/presentation/context/toast-context";
import { useActionStagingTracker } from "@/presentation/hooks/game/use-action-staging-tracker";
import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";

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
  overrideGameState?: GameState | null,
  overrideAdvanceNextTurn?: () => Promise<GameState | null>,
) {
  const [internalActiveTab, setInternalActiveTabState] =
    useState<SidebarTabType | null>(null);
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [activeEventData, setActiveEventData] = useState<{
    title: string;
    description: string;
    choices: {
      id: string;
      description: string;
      effectsSummary: { label: string; value: string; isPositive: boolean }[];
    }[];
  } | null>(null);
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

  const gameState = overrideGameState ?? null;
  const advanceNextTurn = overrideAdvanceNextTurn;

  const activeTab = externalActiveTab || internalActiveTab;
  const humanNation =
    gameState && gameState.humanNationId
      ? gameState.nations[gameState.humanNationId] || null
      : null;

  const currentTurn = gameState ? gameState.currentTurn : 1;

  const setInternalActiveTab = useCallback(
    (tab: SidebarTabType | null) => {
      setInternalActiveTabState(tab);
      if (onClearExternalTab) {
        onClearExternalTab();
      }
    },
    [onClearExternalTab],
  );

  const handleCloseActiveModal = useCallback(() => {
    setInternalActiveTabState(null);
    if (onClearExternalTab) {
      onClearExternalTab();
    }
  }, [onClearExternalTab]);

  const mapLogToReport = (
    log: TurnLogEntry,
    state: GameState,
  ): CombatReport => {
    const meta = log.metadata || {};
    const isCombat = log.level === "COMBAT";
    const isVictory =
      typeof meta.isVictory === "boolean" ? meta.isVictory : true;

    let severity: ReportSeverity = "INFO";
    if (isCombat) {
      severity = isVictory ? "VICTORY" : "DEFEAT";
    } else if (log.level === "CRITICAL") {
      severity = "CRITICAL_DEFEAT";
    } else if (log.level === "WARNING") {
      severity = "PYRRHIC_VICTORY";
    }

    const sourceName =
      state.nations[log.sourceNationId]?.name || log.sourceNationId;
    const targetName = log.targetNationId
      ? state.nations[log.targetNationId]?.name || log.targetNationId
      : "سیستم مرکزی";

    const attackerLost =
      typeof meta.attackerLost === "number" ? meta.attackerLost : 0;
    const defenderLost =
      typeof meta.defenderLost === "number" ? meta.defenderLost : 0;
    const conqueredAreaSqKm =
      typeof meta.conqueredAreaSqKm === "number" ? meta.conqueredAreaSqKm : 0;

    return {
      id: log.id,
      turn: log.turn,
      timestamp: log.timestamp,
      severity,
      title: isCombat
        ? `گزارش عملیات نبرد نوبت ${log.turn}`
        : `گزارش رویداد و حاکمیت نوبت ${log.turn}`,
      summary: log.message,
      attackerNationId: log.sourceNationId,
      attackerName: sourceName,
      defenderNationId: log.targetNationId || "SYSTEM",
      defenderName: targetName,
      attackerCasualties: {
        infantryEngaged: attackerLost > 0 ? attackerLost + 10 : 0,
        infantryLost: attackerLost,
        infantryRetreated: 0,
        airForceEngaged: 0,
        airForceLost: 0,
        droneMissileEngaged: 0,
        droneMissileLost: 0,
      },
      defenderCasualties: {
        infantryEngaged: defenderLost > 0 ? defenderLost + 10 : 0,
        infantryLost: defenderLost,
        infantryRetreated: 0,
        airForceEngaged: 0,
        airForceLost: 0,
        droneMissileEngaged: 0,
        droneMissileLost: 0,
      },
      conqueredAreaSqKm,
      capitulatedAreaSqKm: 0,
      strategicAssessment: isCombat
        ? isVictory
          ? "ارزیابی ستاد کل: عملیات با تثبیت خطوط نبرد همراه بود."
          : "ارزیابی ستاد کل: عقب‌نشینی تاکتیکی جهت تجدید قوا."
        : "ارزیابی ستاد کل: ثبت رویداد در دفتر وقایع رسمی کشور.",
      isVictory,
    };
  };

  const handleNextTurn = async () => {
    if (isProcessingTurn || !advanceNextTurn) return;

    try {
      setIsProcessingTurn(true);
      const nextState = await advanceNextTurn();

      if (!nextState) {
        showToast(
          "خطا در ثبت نوبت",
          "امکان دریافت اطلاعات نوبت جدید از سرور وجود ندارد.",
          "error",
        );
        return;
      }

      const turnLogs = nextState.turnLogs || [];
      const recentTurnLogs = turnLogs.filter(
        (log) => log.turn === nextState.currentTurn - 1,
      );

      const logsToProcess =
        recentTurnLogs.length > 0 ? recentTurnLogs : turnLogs.slice(-10);

      const realReports: CombatReport[] = logsToProcess.map((log) =>
        mapLogToReport(log, nextState),
      );

      setModalReports(realReports);
      setIsModalOpen(true);
      clearStagedActions();

      showToast(
        "نوبت جدید آغاز شد",
        `محاسبات نوبت ${nextState.currentTurn} با موفقیت انجام شد.`,
        "info",
      );

      const pendingEventLog = recentTurnLogs.find(
        (log) => log.level === "WARNING" && log.metadata?.hasChoices === true,
      );

      if (pendingEventLog) {
        setActiveEventData({
          title: "بحران ملی | تصمیم‌گیری راهبردی",
          description: pendingEventLog.message,
          choices: [
            {
              id: "c1",
              description: "مدیریت اضطراری و کنترل منابع",
              effectsSummary: [
                { label: "ثبات", value: "+۵٪", isPositive: true },
              ],
            },
            {
              id: "c2",
              description: "حفظ وضعیت موجود",
              effectsSummary: [
                { label: "ثبات", value: "-۵٪", isPositive: false },
              ],
            },
          ],
        });
        setIsEventModalOpen(true);
      } else {
        setIsEventModalOpen(false);
        setActiveEventData(null);
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
    handleCloseActiveModal,
    handleNextTurn,
    handleOpenTrade,
  };
}
