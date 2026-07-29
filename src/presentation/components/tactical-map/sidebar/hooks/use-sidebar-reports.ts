import { useMemo } from "react";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { GameState } from "@/domain/game/game-state.schema";

export function useSidebarReports(gameState: GameState | null): CombatReport[] {
  return useMemo(() => {
    if (!gameState || !gameState.turnLogs) {
      return [];
    }

    const combatLogs = gameState.turnLogs.filter(
      (log) => log.level === "COMBAT",
    );

    return combatLogs.map((log) => {
      const meta = log.metadata || {};
      const attackerLost =
        typeof meta.attackerLost === "number" ? meta.attackerLost : 10;
      const defenderLost =
        typeof meta.defenderLost === "number" ? meta.defenderLost : 35;
      const attackerRetreated =
        typeof meta.attackerRetreated === "number" ? meta.attackerRetreated : 0;
      const defenderRetreated =
        typeof meta.defenderRetreated === "number" ? meta.defenderRetreated : 0;
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
        title: `گزارش عملیات نوبت ${log.turn}`,
        summary: log.message,
        attackerNationId: log.sourceNationId,
        attackerName:
          gameState.nations[log.sourceNationId]?.name || log.sourceNationId,
        defenderNationId: log.targetNationId || "DEFENDER",
        defenderName: log.targetNationId
          ? gameState.nations[log.targetNationId]?.name || log.targetNationId
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
          ? "ارزیابی ستاد کل: تثبیت کامل خطوط پیشروی نبرد."
          : "ارزیابی ستاد کل: عقب‌نشینی تاکتیکی جهت بازسازی نیروها.",
        isVictory,
      };
    });
  }, [gameState]);
}
