import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";

export function useAllianceMatrix(
  state: GameState | null,
  humanNationId: string | null,
) {
  const activeAlliances = useMemo(() => {
    if (!state || !humanNationId) {
      return [];
    }
    const human = state.nations[humanNationId];
    if (!human) {
      return [];
    }
    return Object.values(human.relations).filter(
      (r) => r.stance === "ALLIANCE" || r.stance === "NON_AGGRESSION_PACT",
    );
  }, [state, humanNationId]);

  return {
    activeAlliances,
  };
}
