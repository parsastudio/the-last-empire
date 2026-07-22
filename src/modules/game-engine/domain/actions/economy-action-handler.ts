import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { IndustrialLevelManager } from "@/modules/economy/domain/industrial-level-manager";
import { InfrastructureManager } from "@/modules/economy/domain/infrastructure-manager";
import { ActionHandler } from "./action-handler";

export class UpgradeIndustrialLevelActionHandler implements ActionHandler {
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

export class InvestInfrastructureActionHandler implements ActionHandler {
  private infraManager = new InfrastructureManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "INVEST_INFRASTRUCTURE") {
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
        [action.nationId]: this.infraManager.upgradeInfrastructure(nation),
      },
    };
  }
}
