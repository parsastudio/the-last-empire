import type { GameState } from "@/domain/game/game-state.schema";
import { GameStateSchema } from "@/domain/game/game-state.schema";
import { GameError } from "@/domain/shared/domain-utilities";

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
