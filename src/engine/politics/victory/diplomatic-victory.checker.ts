import { GameState } from "@/domain/game/game-state.schema";
import { VictoryCondition } from "./victory-condition.interface";
import { VictoryStatus } from "../victory-checker";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

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

    const humanCanonicalId = NationIdResolver.resolveCanonicalId(
      state.humanNationId,
    );
    const humanNation =
      state.nations[state.humanNationId] || state.nations[humanCanonicalId];

    for (const nation of aliveNations) {
      let coalitionPopulation = nation.population;
      let maxPartnerPop = 0;
      for (const [targetId, rel] of Object.entries(nation.relations || {})) {
        if (!rel) continue;
        if (rel.stance === "ALLIANCE") {
          const canonicalTargetId =
            NationIdResolver.resolveCanonicalId(targetId);
          const partner =
            state.nations[targetId] || state.nations[canonicalTargetId];
          if (partner && partner.isAlive) {
            coalitionPopulation += partner.population;
            maxPartnerPop = Math.max(maxPartnerPop, partner.population);
          }
        }
      }

      const isHumanInCoalition =
        nation.id === state.humanNationId ||
        nation.id === humanCanonicalId ||
        nation.relations?.[state.humanNationId]?.stance === "ALLIANCE" ||
        nation.relations?.[humanCanonicalId]?.stance === "ALLIANCE";

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
