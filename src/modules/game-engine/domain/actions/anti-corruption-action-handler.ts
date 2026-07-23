import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  AntiCorruptionDriveAction,
} from "@/modules/game-engine/schemas/action.schema";
import { CorruptionManager } from "@/modules/politics/domain/corruption-manager";
import type { ActionHandler } from "./action-handler";

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
