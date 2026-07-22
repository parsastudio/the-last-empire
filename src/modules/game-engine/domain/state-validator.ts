import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { GameError } from "@/core/errors/game-error";

export class StateValidator {
  public validateAction(state: GameState, action: GameAction): void {
    if (state.isGameOver) {
      throw new GameError(
        "STATE_FROZEN",
        "Cannot execute actions after game over",
      );
    }

    const sourceNation = state.nations[action.nationId];
    if (!sourceNation || !sourceNation.isAlive) {
      throw new GameError(
        "NATION_NOT_FOUND",
        `Nation ID ${action.nationId} is not alive or does not exist`,
      );
    }

    if ("targetNationId" in action && action.targetNationId) {
      const targetNation = state.nations[action.targetNationId];
      if (!targetNation || !targetNation.isAlive) {
        throw new GameError(
          "NATION_NOT_FOUND",
          `Target nation ID ${action.targetNationId} is not alive or does not exist`,
        );
      }
    }

    if (action.type === "SET_TAX_RATE") {
      if (action.newRate < 0 || action.newRate > 100) {
        throw new GameError(
          "INVALID_ACTION",
          "Tax rate must be between 0 and 100",
        );
      }
    }

    if (action.type === "RECRUIT_UNIT") {
      if (action.quantity <= 0) {
        throw new GameError(
          "INVALID_ACTION",
          "Recruitment quantity must be greater than zero",
        );
      }
    }

    if (action.type === "FUND_ESPIONAGE") {
      if (action.budget <= 0) {
        throw new GameError(
          "INVALID_ACTION",
          "Funding budget must be positive",
        );
      }
    }

    if (action.type === "COVERT_OPERATIONS") {
      const relation = sourceNation.relations[action.targetNationId];
      if (!relation || relation.spyNetworkStrength < 20) {
        throw new GameError(
          "INVALID_ACTION",
          "Infiltration requires at least 20 spy network strength",
        );
      }
    }
  }
}
