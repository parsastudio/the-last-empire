import { GameState } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@geopolitics/domain";

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

    const totalWorldTerritory = Object.values(state.provinces || {}).reduce(
      (sum, p) => sum + (p.pixelCount || 0),
      0,
    );

    if (totalWorldTerritory > 0) {
      for (const nation of aliveNations) {
        const nationPixels = NationGettersUtility.getTerritoryPixelCount(
          nation.id,
          state.provinces,
        );
        const territoryShare = nationPixels / totalWorldTerritory;
        if (territoryShare >= 0.65) {
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
      state.nations[humanCanonicalId] || state.nations[state.humanNationId];
    if (humanNation && !humanNation.isAlive) {
      return {
        isGameOver: true,
        reason: "HUMAN_PLAYER_DEFEATED",
      };
    }

    return null;
  }
}
