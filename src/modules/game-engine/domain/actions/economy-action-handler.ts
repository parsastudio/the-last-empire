import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { IndustrialLevelManager } from "@/modules/economy/domain/industrial-level-manager";
import { InfrastructureManager } from "@/modules/economy/domain/infrastructure-manager";
import { ActionHandler } from "./action-handler";

export class EconomyActionHandler implements ActionHandler {
  private industrialManager = new IndustrialLevelManager();
  private infraManager = new InfrastructureManager();

  public execute(state: GameState, action: GameAction): GameState {
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }

    let updatedNation = { ...nation };

    if (action.type === "UPGRADE_INDUSTRIAL_LEVEL") {
      updatedNation = this.industrialManager.upgradeIndustrialLevel(nation);
    } else if (action.type === "INVEST_INFRASTRUCTURE") {
      updatedNation = this.infraManager.upgradeInfrastructure(nation);
    }

    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: updatedNation,
      },
    };
  }
}
