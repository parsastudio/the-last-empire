import { useState } from "react";
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
) {
  const [internalActiveTab, setInternalActiveTab] =
    useState<SidebarTabType | null>(null);
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
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
  const { gameState, advanceNextTurn } = useGeopoliticsGame();

  const activeTab = externalActiveTab || internalActiveTab;
  const humanNation =
    gameState && gameState.humanNationId
      ? gameState.nations[gameState.humanNationId] || null
      : null;

  const currentTurn = gameState ? gameState.currentTurn : 1;

  const handleNextTurn = async () => {
    const nextState = await advanceNextTurn();
    const reportsSource = nextState || gameState;

    const combatLogs = reportsSource?.turnLogs
      ? reportsSource.turnLogs.filter((log) => log.level === "COMBAT")
      : [];

    const realReports: CombatReport[] = combatLogs.map((log) => ({
      id: log.id,
      turn: log.turn,
      timestamp: log.timestamp,
      severity: "VICTORY" as const,
      title: `گزارش عملیاتی نوبت ${log.turn}`,
      summary: log.message,
      attackerNationId: log.sourceNationId,
      attackerName:
        reportsSource?.nations[log.sourceNationId]?.name || log.sourceNationId,
      defenderNationId: log.targetNationId || "DEFENDER",
      defenderName: log.targetNationId
        ? reportsSource?.nations[log.targetNationId]?.name || log.targetNationId
        : "دشمن",
      attackerCasualties: {
        infantryEngaged: 100,
        infantryLost: 10,
        airForceEngaged: 10,
        airForceLost: 1,
        droneMissileEngaged: 5,
        droneMissileLost: 0,
      },
      defenderCasualties: {
        infantryEngaged: 100,
        infantryLost: 35,
        airForceEngaged: 10,
        airForceLost: 4,
        droneMissileEngaged: 0,
        droneMissileLost: 0,
      },
      conqueredAreaSqKm: 12500,
      capitulatedAreaSqKm: 0,
      strategicAssessment:
        "ارزیابی ستاد کل: عملیات با تثبیت خطوط نبرد همراه بود.",
      isVictory: true,
    }));

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
    modalReports,
    stagedActions,
    tradeDialog,
    humanNation,
    currentTurn,
    realReports: modalReports,
    setIsRailCollapsed,
    setInternalActiveTab,
    setIsModalOpen,
    setIsEventModalOpen,
    setModalReports,
    setStagedActions,
    setTradeDialog,
    handleNextTurn,
    handleOpenTrade,
  };
}
