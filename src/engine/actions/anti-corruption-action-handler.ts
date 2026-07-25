import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  AntiCorruptionDriveAction,
} from "@/domain/game/action.schema";
import { CorruptionManager } from "@/engine/politics/corruption-manager";
import type { ActionHandler } from "@/engine/actions/action-handler";

export class AntiCorruptionActionHandler implements ActionHandler {
  private corruptionManager = new CorruptionManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "ANTI_CORRUPTION_DRIVE") {
      return state;
    }
    const antiAction = action as AntiCorruptionDriveAction;
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: this.corruptionManager.antiCorruptionDrive(
          nation,
          antiAction.amount,
        ),
      },
    };
  }
}
