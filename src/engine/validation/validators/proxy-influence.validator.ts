import { GameState } from "@/domain/game/game-state.schema";
import {
  GameAction,
  FundProxyInfluenceAction,
} from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";

export class ProxyInfluenceValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "FUND_PROXY_INFLUENCE";
  }

  public validate(state: GameState, action: GameAction): void {
    const proxyAction = action as FundProxyInfluenceAction;
    if (proxyAction.budget <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Proxy war budget must be positive",
      );
    }
    const sourceNation = state.nations[action.nationId];
    if (sourceNation && sourceNation.treasury < proxyAction.budget) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Insufficient funds to sponsor proxy influence",
      );
    }
  }
}
