import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";

export interface ActionValidator {
  supports(actionType: string): boolean;
  validate(state: GameState, action: GameAction): void;
}
