import type { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";

export class EconomicConcurrencyRules {
  public verify(actionList: GameAction[], newAction: GameAction): void {
    const hasConflictingTrade =
      newAction.type === "TRADE_RESOURCES" &&
      actionList.some(
        (a) =>
          a.type === "TRADE_RESOURCES" &&
          a.nationId === newAction.nationId &&
          a.resourceType === newAction.resourceType &&
          a.isBuy !== newAction.isBuy,
      );
    if (hasConflictingTrade) {
      throw new GameError(
        "INVALID_ACTION",
        "Conflicting trade operations queued for the same resource in a single turn",
      );
    }

    const isDuplicateTrade =
      newAction.type === "TRADE_RESOURCES" &&
      actionList.some(
        (a) =>
          a.type === "TRADE_RESOURCES" &&
          a.nationId === newAction.nationId &&
          a.resourceType === newAction.resourceType &&
          a.isBuy === newAction.isBuy,
      );
    if (isDuplicateTrade) {
      throw new GameError(
        "INVALID_ACTION",
        "Already enqueued a trade operation for this resource this turn",
      );
    }

    const isDuplicateInfra =
      newAction.type === "INVEST_INFRASTRUCTURE" &&
      actionList.some(
        (a) =>
          a.type === "INVEST_INFRASTRUCTURE" &&
          a.nationId === newAction.nationId,
      );
    if (isDuplicateInfra) {
      throw new GameError(
        "INVALID_ACTION",
        "Already enqueued infrastructure upgrade for this turn",
      );
    }

    const isDuplicateIndustry =
      newAction.type === "UPGRADE_INDUSTRIAL_LEVEL" &&
      actionList.some(
        (a) =>
          a.type === "UPGRADE_INDUSTRIAL_LEVEL" &&
          a.nationId === newAction.nationId,
      );
    if (isDuplicateIndustry) {
      throw new GameError(
        "INVALID_ACTION",
        "Already enqueued industrial level upgrade for this turn",
      );
    }
  }
}
