import { GameState } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";

export interface VictoryStatus {
  isGameOver: boolean;
  winnerNationId?: string;
  reason?: string;
}

export interface VictoryCondition {
  evaluate(state: GameState): VictoryStatus | null;
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
