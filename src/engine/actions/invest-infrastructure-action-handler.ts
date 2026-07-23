import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { InfrastructureManager } from "@/engine/economy/infrastructure-manager";
import type { ActionHandler } from "./action-handler";

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
