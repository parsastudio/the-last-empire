import { GameState } from "@/domain/game/game-state.schema";

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
      const threatened = aliveNations.filter(
        (n) =>
          n.id !== threat.id &&
          n.relations[threat.id] &&
          n.relations[threat.id].opinion < -20,
      );

      if (threatened.length >= 2) {
        for (let i = 0; i < threatened.length; i++) {
          for (let j = i + 1; j < threatened.length; j++) {
            const nationA = threatened[i]!;
            const nationB = threatened[j]!;

            const relA = nationA.relations[nationB.id];
            if (relA && relA.stance === "PEACE" && relA.opinion >= 0) {
              const updatedA = updatedNations[nationA.id] || nationA;
              const updatedB = updatedNations[nationB.id] || nationB;

              updatedNations[nationA.id] = {
                ...updatedA,
                relations: {
                  ...updatedA.relations,
                  [nationB.id]: {
                    ...relA,
                    stance: "NON_AGGRESSION_PACT",
                  },
                },
              };

              const relB = nationB.relations[nationA.id];
              if (relB) {
                updatedNations[nationB.id] = {
                  ...updatedB,
                  relations: {
                    ...updatedB.relations,
                    [nationA.id]: {
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
