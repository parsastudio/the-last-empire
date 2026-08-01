import { GameState } from "@/domain/game/game-state.schema";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export class CoalitionManager {
  public processCoalitions(state: GameState): GameState {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    const globalThreats = aliveNations.filter(
      (n) => n.globalReputation <= -40 || n.government.type === "FASCISM",
    );

    if (globalThreats.length === 0) {
      return state;
    }

    const updatedNations = { ...state.nations };

    for (const threat of globalThreats) {
      const canonicalThreatId = NationIdResolver.resolveCanonicalId(threat.id);

      const threatened = aliveNations.filter((n) => {
        if (n.id === threat.id || n.id === canonicalThreatId) return false;
        const rel =
          n.relations?.[threat.id] || n.relations?.[canonicalThreatId];
        return rel && rel.opinion < -20;
      });

      if (threatened.length >= 2) {
        for (let i = 0; i < threatened.length; i++) {
          for (let j = i + 1; j < threatened.length; j++) {
            const nationA = threatened[i]!;
            const nationB = threatened[j]!;

            const canonicalB = NationIdResolver.resolveCanonicalId(nationB.id);
            const canonicalA = NationIdResolver.resolveCanonicalId(nationA.id);

            const relAKey = nationA.relations?.[nationB.id]
              ? nationB.id
              : canonicalB;
            const relA = nationA.relations?.[relAKey];

            if (
              relA &&
              relA.stance === "NORMAL_DIPLOMACY" &&
              relA.opinion >= 0
            ) {
              const updatedA = updatedNations[nationA.id] || nationA;
              const updatedB = updatedNations[nationB.id] || nationB;

              updatedNations[nationA.id] = {
                ...updatedA,
                relations: {
                  ...updatedA.relations,
                  [relAKey]: {
                    ...relA,
                    stance: "NON_AGGRESSION_PACT",
                  },
                },
              };

              const relBKey = updatedB.relations?.[nationA.id]
                ? nationA.id
                : canonicalA;
              const relB = updatedB.relations?.[relBKey];

              if (relB) {
                updatedNations[nationB.id] = {
                  ...updatedB,
                  relations: {
                    ...updatedB.relations,
                    [relBKey]: {
                      ...relB,
                      stance: "NON_AGGRESSION_PACT",
                    },
                  },
                };
              }
            }
          }
        }
      }
    }

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
