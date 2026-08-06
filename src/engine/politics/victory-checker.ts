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

export class EconomicVictoryChecker implements VictoryCondition {
  public evaluate(state: GameState): VictoryStatus | null {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    const totalGlobalGdp = aliveNations.reduce((sum, n) => sum + n.gdp, 0);
    if (totalGlobalGdp <= 0) {
      return null;
    }

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

    return null;
  }
}

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

    const humanCanonicalId = CountryRegistry.resolveCanonicalId(
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
            CountryRegistry.resolveCanonicalId(targetId);
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

export class VictoryChecker {
  private checkers: VictoryCondition[] = [
    new ConquestVictoryChecker(),
    new EconomicVictoryChecker(),
    new DiplomaticVictoryChecker(),
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
}
