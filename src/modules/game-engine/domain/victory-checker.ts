import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";

export interface VictoryStatus {
  isGameOver: boolean;
  winnerNationId?: string;
  reason?: string;
}

export class VictoryChecker {
  public checkVictory(state: GameState): VictoryStatus {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);

    if (aliveNations.length === 0) {
      return {
        isGameOver: true,
        reason: "ALL_NATIONS_DESTROYED",
      };
    }

    if (aliveNations.length === 1) {
      return {
        isGameOver: true,
        winnerNationId: aliveNations[0].id,
        reason: "WORLD_CONQUEST",
      };
    }

    const humanNation = state.nations[state.humanNationId];
    if (humanNation && !humanNation.isAlive) {
      return {
        isGameOver: true,
        reason: "HUMAN_PLAYER_DEFEATED",
      };
    }

    const totalGlobalGdp = aliveNations.reduce((sum, n) => sum + n.gdp, 0);
    if (totalGlobalGdp > 0) {
      for (const nation of aliveNations) {
        const share = nation.gdp / totalGlobalGdp;
        if (share >= 0.6) {
          return {
            isGameOver: true,
            winnerNationId: nation.id,
            reason: "ECONOMIC_DOMINANCE",
          };
        }
      }
    }

    const peacefulTurns = state.peacefulTurnsCount ?? 0;
    if (peacefulTurns >= 30) {
      const totalPopulation = aliveNations.reduce(
        (sum, n) => sum + n.population,
        0,
      );
      if (totalPopulation > 0) {
        for (const nation of aliveNations) {
          let coalitionPopulation = nation.population;
          let maxPartnerPop = 0;
          for (const [targetId, rel] of Object.entries(nation.relations)) {
            if (rel.stance === "ALLIANCE") {
              const partner = state.nations[targetId];
              if (partner && partner.isAlive) {
                coalitionPopulation += partner.population;
                maxPartnerPop = Math.max(maxPartnerPop, partner.population);
              }
            }
          }

          const isHumanInCoalition =
            nation.id === state.humanNationId ||
            nation.relations[state.humanNationId]?.stance === "ALLIANCE";

          let isHumanDominant = false;
          if (isHumanInCoalition && humanNation) {
            if (humanNation.population >= maxPartnerPop) {
              isHumanDominant = true;
            }
          }

          if (coalitionPopulation / totalPopulation >= 0.7) {
            return {
              isGameOver: true,
              winnerNationId:
                isHumanInCoalition && isHumanDominant
                  ? state.humanNationId
                  : nation.id,
              reason: "DIPLOMATIC_HEGEMONY",
            };
          }
        }
      }
    }

    return {
      isGameOver: false,
    };
  }
}
