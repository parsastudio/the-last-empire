import type { GameState } from "@/core/types/game-state.types";

export interface GlobalStats {
  richestNationId: string;
  richestNationTreasury: number;
  strongestNationId: string;
  strongestNationMilitaryCount: number;
  totalGlobalPopulation: number;
  totalGlobalTreasury: number;
  aliveNationsCount: number;
}

export class GlobalStatsCalculator {
  public calculateGlobalStats(state: GameState): GlobalStats {
    let richestNationId = "";
    let richestNationTreasury = -Infinity;
    let strongestNationId = "";
    let strongestNationMilitaryCount = -Infinity;
    let totalGlobalPopulation = 0;
    let totalGlobalTreasury = 0;
    let aliveNationsCount = 0;

    for (const [id, nation] of Object.entries(state.nations)) {
      if (!nation.isAlive) {
        continue;
      }

      aliveNationsCount++;
      totalGlobalPopulation += nation.population;
      totalGlobalTreasury += nation.treasury;

      if (nation.treasury > richestNationTreasury) {
        richestNationTreasury = nation.treasury;
        richestNationId = id;
      }

      const militaryCount =
        nation.military.infantry +
        nation.military.airForce +
        nation.military.navy +
        nation.military.droneMissile;

      if (militaryCount > strongestNationMilitaryCount) {
        strongestNationMilitaryCount = militaryCount;
        strongestNationId = id;
      }
    }

    return {
      richestNationId,
      richestNationTreasury:
        richestNationTreasury === -Infinity ? 0 : richestNationTreasury,
      strongestNationId,
      strongestNationMilitaryCount:
        strongestNationMilitaryCount === -Infinity
          ? 0
          : strongestNationMilitaryCount,
      totalGlobalPopulation,
      totalGlobalTreasury,
      aliveNationsCount,
    };
  }
}
