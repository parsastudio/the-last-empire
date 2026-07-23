import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  FundProxyInfluenceAction,
} from "@/domain/game/action.schema";
import { ProxyWarManager } from "@/engine/politics/proxy-war-manager";
import type { ActionHandler } from "./action-handler";

export class FundProxyInfluenceActionHandler implements ActionHandler {
  private proxyManager = new ProxyWarManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "FUND_PROXY_INFLUENCE") {
      return state;
    }
    const proxyAction = action as FundProxyInfluenceAction;
    const source = state.nations[action.nationId];
    if (!source) {
      return state;
    }

    const updatedSource = this.proxyManager.addProxyBudget(
      source,
      proxyAction.targetNationId,
      proxyAction.budget,
    );

    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: updatedSource,
      },
    };
  }
}
