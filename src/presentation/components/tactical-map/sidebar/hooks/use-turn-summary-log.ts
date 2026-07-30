import { useCallback } from "react";
import {
  CombatReport,
  ReportSeverity,
} from "@/domain/reports/combat-report.schema";
import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { translateActionLogMessage } from "@/domain/game/action-translations";

export function useTurnSummaryLog() {
  const mapLogToReport = useCallback(
    (log: TurnLogEntry, state: GameState): CombatReport => {
      let severity: ReportSeverity = "INFO";
      if (log.level === "CRITICAL") {
        severity = "CRITICAL_DEFEAT";
      } else if (log.level === "WARNING") {
        severity = "PYRRHIC_VICTORY";
      }

      const sourceName =
        state.nations[log.sourceNationId]?.name || log.sourceNationId;
      const targetName = log.targetNationId
        ? state.nations[log.targetNationId]?.name || log.targetNationId
        : "سیستم مرکزی";

      const translatedSummary = translateActionLogMessage(log.message);

      return {
        id: log.id,
        turn: log.turn,
        timestamp: log.timestamp,
        severity,
        title: `گزارش حاکمیت نوبت ${log.turn}`,
        summary: translatedSummary,
        attackerNationId: log.sourceNationId,
        attackerName: sourceName,
        defenderNationId: log.targetNationId || "SYSTEM",
        defenderName: targetName,
        attackerCasualties: {
          infantryEngaged: 0,
          infantryLost: 0,
          airForceEngaged: 0,
          airForceLost: 0,
          droneMissileEngaged: 0,
          droneMissileLost: 0,
        },
        defenderCasualties: {
          infantryEngaged: 0,
          infantryLost: 0,
          airForceEngaged: 0,
          airForceLost: 0,
          droneMissileEngaged: 0,
          droneMissileLost: 0,
        },
        conqueredAreaSqKm: 0,
        capitulatedAreaSqKm: 0,
        strategicAssessment:
          "ارزیابی ستاد کل: ثبت رویداد در دفتر وقایع رسمی کشور.",
        isVictory: true,
      };
    },
    [],
  );

  return { mapLogToReport };
}
