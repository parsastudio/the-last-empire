import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { CombatReport } from "@/domain/reports/combat-report.schema";

export function useRealCombatReports(
  gameState: GameState | null,
): CombatReport[] {
  return useMemo(() => {
    if (!gameState || !gameState.turnLogs) return [];

    return gameState.turnLogs.map((log) => ({
      id: log.id,
      turn: log.turn,
      timestamp: log.timestamp,
      severity: "INFO",
      title: `گزارش حاکمیت نوبت ${log.turn}`,
      summary: log.message,
      attackerNationId: log.sourceNationId,
      attackerName:
        gameState.nations[log.sourceNationId]?.name || log.sourceNationId,
      defenderNationId: log.targetNationId || "SYSTEM",
      defenderName: log.targetNationId
        ? gameState.nations[log.targetNationId]?.name || log.targetNationId
        : "سیستم",
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
      strategicAssessment: "ثبت رویداد در دفتر وقایع رسمی کشور.",
      isVictory: true,
    }));
  }, [gameState]);
}
