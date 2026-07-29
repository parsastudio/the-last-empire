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
    const sourceNation = state.nations[action.nationId];
    const targetNation = state.nations[proxyAction.targetNationId];

    if (!sourceNation) {
      throw new GameError("NATION_NOT_FOUND", "Source nation does not exist");
    }

    if (!targetNation || !targetNation.isAlive) {
      throw new GameError(
        "NATION_NOT_FOUND",
        "Target nation does not exist or is not alive",
      );
    }

    const drainAmount = 2;
    const requiredBudget = Math.floor(
      targetNation.gdp * (drainAmount / 2) * 0.01,
    );

    if (sourceNation.treasury < requiredBudget) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        `Insufficient treasury to fund proxy operation. Required: ${requiredBudget}`,
      );
    }
  }
}
