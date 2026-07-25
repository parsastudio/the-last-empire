import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { IndustrialLevelManager } from "@/engine/economy/industrial-level-manager";
import type { ActionHandler } from "@/engine/actions/action-handler";

export class UpgradeIndustrialActionHandler implements ActionHandler {
  private industrialManager = new IndustrialLevelManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "UPGRADE_INDUSTRIAL_LEVEL") {
      return state;
    }
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]:
          this.industrialManager.upgradeIndustrialLevel(nation),
      },
    };
  }
}
