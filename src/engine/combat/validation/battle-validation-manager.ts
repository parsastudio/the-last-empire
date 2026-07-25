import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { StateValidatorBridge } from "@/engine/validation/state-validator-bridge";

export class BattleValidationManager {
  private bridge = new StateValidatorBridge();

  public validateAction(state: GameState, action: GameAction): void {
    this.bridge.validateAction(state, action);
  }
}
