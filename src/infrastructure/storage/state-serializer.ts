import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { GameStateSchema } from "@/modules/game-engine/schemas/game-state.schema";
import { GameError } from "@/core/errors/game-error";

export class StateSerializer {
  public serialize(state: GameState): string {
    try {
      const validated = GameStateSchema.parse(state);
      const visited = new Set();
      const cleanState = JSON.parse(
        JSON.stringify(validated, (key, value) => {
          if (typeof value === "object" && value !== null) {
            if (visited.has(value)) {
              return undefined;
            }
            visited.add(value);
          }
          return value;
        }),
      );
      return JSON.stringify(cleanState);
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
