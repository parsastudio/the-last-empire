import { useState, useCallback } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { useToast } from "@/presentation/context/toast-context";
import { useTurnSummaryLog } from "./use-turn-summary-log";

export interface PendingEventData {
  title: string;
  description: string;
  choices: {
    id: string;
    description: string;
    effectsSummary: { label: string; value: string; isPositive: boolean }[];
  }[];
}

export function useTurnExecution(
  advanceNextTurn?: () => Promise<GameState | null>,
  onTurnComplete?: (reports: CombatReport[]) => void,
) {
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [activeEventData, setActiveEventData] =
    useState<PendingEventData | null>(null);

  const { showToast } = useToast();
  const { mapLogToReport } = useTurnSummaryLog();

  const handleNextTurn = useCallback(async () => {
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
      const humanId = nextState.humanNationId;

      const userLogs = turnLogs.filter(
        (log) =>
          log.turn === nextState.currentTurn - 1 &&
          (log.sourceNationId === humanId || log.targetNationId === humanId),
      );

      const logsToProcess =
        userLogs.length > 0
          ? userLogs
          : turnLogs
              .filter((log) => log.turn === nextState.currentTurn - 1)
              .slice(-10);

      const reports: CombatReport[] = logsToProcess.map((log) =>
        mapLogToReport(log, nextState),
      );

      if (onTurnComplete) {
        onTurnComplete(reports);
      }

      showToast(
        "نوبت جدید آغاز شد",
        `محاسبات نوبت ${nextState.currentTurn} با موفقیت انجام شد.`,
        "info",
      );

      const pendingEventLog = turnLogs.find(
        (log) =>
          log.turn === nextState.currentTurn - 1 &&
          log.level === "WARNING" &&
          log.metadata?.hasChoices === true,
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
  }, [
    isProcessingTurn,
    advanceNextTurn,
    mapLogToReport,
    onTurnComplete,
    showToast,
  ]);

  return {
    isProcessingTurn,
    isEventModalOpen,
    activeEventData,
    setIsEventModalOpen,
    handleNextTurn,
  };
}
