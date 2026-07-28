import { useMemo } from "react";
import { CombatReportEngine } from "@/engine/reports/combat-report-engine";
import { CombatReport } from "@/domain/reports/combat-report.schema";

export function useSidebarReports(currentTurn: number) {
  return useMemo(() => {
    const reportEngine = new CombatReportEngine();

    const mockDefeatReport = reportEngine.createReport({
      attackerId: "IRN",
      attackerNameFa: "ایران",
      defenderId: "USA",
      defenderNameFa: "ایالات متحده آمریکا",
      turn: currentTurn,
      attackerCasualties: {
        infantryEngaged: 450,
        infantryLost: 135,
        airForceEngaged: 40,
        airForceLost: 18,
        droneMissileEngaged: 60,
        droneMissileLost: 45,
      },
      defenderCasualties: {
        infantryEngaged: 1000,
        infantryLost: 80,
        airForceEngaged: 250,
        airForceLost: 12,
        droneMissileEngaged: 80,
        droneMissileLost: 10,
      },
      conqueredPixelsCount: 0,
      capitulatedPixelsCount: 0,
      governmentType: "DICTATORSHIP",
    });

    const mockVictoryReport = reportEngine.createReport({
      attackerId: "IRN",
      attackerNameFa: "ایران",
      defenderId: "ISR",
      defenderNameFa: "اسرائیل",
      turn: currentTurn,
      attackerCasualties: {
        infantryEngaged: 450,
        infantryLost: 45,
        airForceEngaged: 40,
        airForceLost: 6,
        droneMissileEngaged: 60,
        droneMissileLost: 15,
      },
      defenderCasualties: {
        infantryEngaged: 200,
        infantryLost: 110,
        airForceEngaged: 75,
        airForceLost: 28,
        droneMissileEngaged: 35,
        droneMissileLost: 25,
      },
      conqueredPixelsCount: 48,
      capitulatedPixelsCount: 12,
      governmentType: "DICTATORSHIP",
    });

    return [mockDefeatReport, mockVictoryReport] as CombatReport[];
  }, [currentTurn]);
}
