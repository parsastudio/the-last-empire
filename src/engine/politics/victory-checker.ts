import { GameState } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export interface VictoryStatus {
  isGameOver: boolean;
  winnerNationId?: string;
  reason?: string;
}

export interface VictoryCondition {
  evaluate(state: GameState): VictoryStatus | null;
}

export interface VictoryProgressMetrics {
  territorySharePct: number;
  territoryTargetPct: number;
  territoryProgressPct: number;
  gdpSharePct: number;
  gdpTargetPct: number;
  gdpProgressPct: number;
}

export class ConquestVictoryChecker implements VictoryCondition {
  public evaluate(state: GameState): VictoryStatus | null {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);

    if (aliveNations.length === 0) {
      return {
        isGameOver: true,
        reason: "ALL_NATIONS_DESTROYED",
      };
    }

    if (aliveNations.length === 1) {
      const winner = aliveNations[0];
      return {
        isGameOver: true,
        winnerNationId: winner ? winner.id : undefined,
        reason: "WORLD_CONQUEST",
      };
    }

    const totalWorldTerritory = aliveNations.reduce(
      (sum, n) => sum + (n.geography?.territoryPixelCount || 0),
      0,
    );

    if (totalWorldTerritory > 0) {
      for (const nation of aliveNations) {
        const territoryShare =
          (nation.geography?.territoryPixelCount || 0) / totalWorldTerritory;
        if (territoryShare >= 0.8) {
          return {
            isGameOver: true,
            winnerNationId: nation.id,
            reason: "TERRITORIAL_DOMINANCE",
          };
        }
      }
    }

    const humanCanonicalId = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const humanNation =
      state.nations[state.humanNationId] || state.nations[humanCanonicalId];
    if (humanNation && !humanNation.isAlive) {
      return {
        isGameOver: true,
        reason: "HUMAN_PLAYER_DEFEATED",
      };
    }

    return null;
  }
}

export class EconomicVictoryChecker implements VictoryCondition {
  public evaluate(state: GameState): VictoryStatus | null {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    const totalGlobalGdp = aliveNations.reduce(
      (sum, n) => sum + getNationGdp(n),
      0,
    );
    if (totalGlobalGdp <= 0) {
      return null;
    }

    for (const nation of aliveNations) {
      const share = getNationGdp(nation) / totalGlobalGdp;
      if (share >= 0.6) {
        return {
          isGameOver: true,
          winnerNationId: nation.id,
          reason: "ECONOMIC_DOMINANCE",
        };
      }
    }

    return null;
  }
}

export class VictoryChecker {
  private checkers: VictoryCondition[] = [
    new ConquestVictoryChecker(),
    new EconomicVictoryChecker(),
  ];

  public checkVictory(state: GameState): VictoryStatus {
    for (const checker of this.checkers) {
      const result = checker.evaluate(state);
      if (result) {
        return result;
      }
    }

    return {
      isGameOver: false,
    };
  }

  public static calculateProgress(
    state: GameState | null,
    nationId: string,
  ): VictoryProgressMetrics {
    if (!state) {
      return {
        territorySharePct: 0,
        territoryTargetPct: 80,
        territoryProgressPct: 0,
        gdpSharePct: 0,
        gdpTargetPct: 60,
        gdpProgressPct: 0,
      };
    }

    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    const targetNation = state.nations[nationId] || state.nations[canonicalId];

    if (!targetNation) {
      return {
        territorySharePct: 0,
        territoryTargetPct: 80,
        territoryProgressPct: 0,
        gdpSharePct: 0,
        gdpTargetPct: 60,
        gdpProgressPct: 0,
      };
    }

    const totalWorldTerritory = aliveNations.reduce(
      (sum, n) => sum + (n.geography?.territoryPixelCount || 0),
      0,
    );
    const nationTerritory = targetNation.geography?.territoryPixelCount || 0;
    const territorySharePct =
      totalWorldTerritory > 0
        ? (nationTerritory / totalWorldTerritory) * 100
        : 0;
    const territoryProgressPct = Math.min(100, (territorySharePct / 80) * 100);

    const totalGlobalGdp = aliveNations.reduce(
      (sum, n) => sum + getNationGdp(n),
      0,
    );
    const nationGdp = getNationGdp(targetNation);
    const gdpSharePct =
      totalGlobalGdp > 0 ? (nationGdp / totalGlobalGdp) * 100 : 0;
    const gdpProgressPct = Math.min(100, (gdpSharePct / 60) * 100);

    return {
      territorySharePct: Number(territorySharePct.toFixed(1)),
      territoryTargetPct: 80,
      territoryProgressPct: Number(territoryProgressPct.toFixed(1)),
      gdpSharePct: Number(gdpSharePct.toFixed(1)),
      gdpTargetPct: 60,
      gdpProgressPct: Number(gdpProgressPct.toFixed(1)),
    };
  }
}
