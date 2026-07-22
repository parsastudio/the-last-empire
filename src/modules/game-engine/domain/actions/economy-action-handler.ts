import type { GameState } from "@/core/types/game-state.types";
import type { GameAction } from "@/core/types/actions.types";
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

    if (action.type === "UPGRADE_INDUSTRIAL_LEVEL") {
      state.nations[action.nationId] =
        this.industrialManager.upgradeIndustrialLevel(nation);
    } else if (action.type === "INVEST_INFRASTRUCTURE") {
      state.nations[action.nationId] =
        this.infraManager.upgradeInfrastructure(nation);
    }

    return state;
  }
}
