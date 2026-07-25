import { GameState } from "@/domain/game/game-state.schema";
import { ActivateAbilityAction } from "@/domain/game/action.schema";

export interface AbilityHandler {
  supports(abilityType: string): boolean;
  execute(state: GameState, action: ActivateAbilityAction): GameState;
}
