import { GameState } from "@/domain/game/game-state.schema";
import { VictoryCondition } from "./victory-condition.interface";
import { VictoryStatus } from "../victory-checker";

export class DiplomaticVictoryChecker implements VictoryCondition {
  public evaluate(state: GameState): VictoryStatus | null {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    const totalPopulation = aliveNations.reduce(
      (sum, n) => sum + n.population,
      0,
    );
    if (totalPopulation <= 0) {
      return null;
    }

    const humanNation = state.nations[state.humanNationId];

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

    return null;
  }
}
