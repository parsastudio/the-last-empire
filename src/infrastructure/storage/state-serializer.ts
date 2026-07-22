import type { GameState } from "@/core/types/game-state.types";
import { GameStateSchema } from "@/modules/game-engine/schemas/game-state.schema";
import { GameError } from "@/core/errors/game-error";

export class StateSerializer {
  public serialize(state: GameState): string {
    try {
      const validated = GameStateSchema.parse(state);
      return JSON.stringify(validated);
    } catch (err) {
      throw new GameError(
        "INVALID_ACTION",
        "Failed to serialize state due to validation mismatch",
        { originalError: err },
      );
    }
  }

  public deserialize(jsonString: string): GameState {
    try {
      const parsed = JSON.parse(jsonString);
      return GameStateSchema.parse(parsed) as GameState;
    } catch (err) {
      throw new GameError(
        "INVALID_ACTION",
        "Failed to deserialize state due to schema corruption",
        { originalError: err },
      );
    }
  }
}
