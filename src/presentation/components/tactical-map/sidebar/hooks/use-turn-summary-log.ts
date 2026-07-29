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

      const translatedSummary = translateActionLogMessage(log.message);

      return {
        id: log.id,
        turn: log.turn,
        timestamp: log.timestamp,
        severity,
        title: isCombat
          ? `گزارش عملیات نبرد نوبت ${log.turn}`
          : `گزارش رویداد و حاکمیت نوبت ${log.turn}`,
        summary: translatedSummary,
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
    },
    [],
  );

  return { mapLogToReport };
}
