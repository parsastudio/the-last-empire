import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import {
  NationGettersUtility,
  TurnLogBuilder,
  CountryRegistry,
} from "@geopolitics/domain";

export class NationLivenessManager {
  public updateLiveness(state: GameState): GameState {
    const updatedNations: Record<string, Nation> = { ...state.nations };
    const logs = [...state.turnLogs];
    let hasChanges = false;
    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );

    for (const [id, nation] of Object.entries(state.nations)) {
      if (!nation.isAlive) continue;

      const isStillAlive = NationGettersUtility.isAlive(
        nation.id,
        state.provinces,
      );

      if (!isStillAlive) {
        hasChanges = true;
        updatedNations[id] = {
          ...nation,
          isAlive: false,
          treasury: 0,
          nationalDebt: 0,
        };

        const isHuman =
          CountryRegistry.resolveCanonicalId(nation.id) === canonicalHuman;

        logs.push(
          TurnLogBuilder.createLogEntry(
            state.currentTurn,
            nation.id,
            "CRITICAL",
            "NATION_COLLAPSED",
            "DOMESTIC",
            isHuman ? "NATIONAL" : "GLOBAL",
            undefined,
            {},
          ),
        );
      }
    }

    if (!hasChanges) {
      return state;
    }

    return {
      ...state,
      nations: updatedNations,
      turnLogs: logs,
    };
  }
}
