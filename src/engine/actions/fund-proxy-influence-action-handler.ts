import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  FundProxyInfluenceAction,
} from "@/domain/game/action.schema";
import { ProxyWarManager } from "@/engine/politics/proxy-war-manager";
import type { ActionHandler } from "@/engine/actions/action-handler";

export class FundProxyInfluenceActionHandler implements ActionHandler {
  private proxyManager = new ProxyWarManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "FUND_PROXY_INFLUENCE") {
      return state;
    }
    const proxyAction = action as FundProxyInfluenceAction;
    const source = state.nations[action.nationId];
    const target = state.nations[proxyAction.targetNationId];

    if (!source || !target || !target.isAlive) {
      return state;
    }

    const drainAmount = Math.max(
      1,
      Math.min(
        15,
        Math.floor((proxyAction.budget / (target.gdp * 0.01 || 1)) * 2),
      ),
    );

    const result = this.proxyManager.executeProxyOperation(
      source,
      target,
      drainAmount,
    );

    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: result.updatedSourceNation,
        [proxyAction.targetNationId]: result.updatedTargetNation,
      },
    };
  }
}
