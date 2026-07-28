import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { CombatReport } from "@/domain/reports/combat-report.schema";

export function useRealCombatReports(
  gameState: GameState | null,
): CombatReport[] {
  return useMemo(() => {
    if (!gameState || !gameState.turnLogs) return [];

    const combatLogs = gameState.turnLogs.filter(
      (log) => log.level === "COMBAT",
    );

    return combatLogs.map((log) => ({
      id: log.id,
      turn: log.turn,
      timestamp: log.timestamp,
      severity: "VICTORY",
      title: `گزارش عملیاتی نوبت ${log.turn}`,
      summary: log.message,
      attackerNationId: log.sourceNationId,
      attackerName:
        gameState.nations[log.sourceNationId]?.name || log.sourceNationId,
      defenderNationId: log.targetNationId || "DEFENDER",
      defenderName: log.targetNationId
        ? gameState.nations[log.targetNationId]?.name || log.targetNationId
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
  }, [gameState]);
}
