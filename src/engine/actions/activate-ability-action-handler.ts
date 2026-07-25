import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, ActivateAbilityAction } from "@/domain/game/action.schema";
import { ActionHandler } from "@/engine/actions/action-handler";
import { AbilityStrategyRouter } from "./abilities/ability-strategy-router";

export class ActivateAbilityActionHandler implements ActionHandler {
  private router = new AbilityStrategyRouter();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "ACTIVATE_ABILITY") {
      return state;
    }
    return this.router.execute(state, action as ActivateAbilityAction);
  }
}
