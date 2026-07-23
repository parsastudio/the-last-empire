import type { GameAction } from "../schemas/action.schema";
import { GameError } from "@/core/errors/game-error";

export class ActionConcurrencyChecker {
  public verifyConcurrencies(
    actionList: GameAction[],
    newAction: GameAction,
  ): void {
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
        "Conflicting trade operations queued for the same resource in a single turn",
      );
    }
    const isDuplicateGov =
      newAction.type === "CHANGE_GOVERNMENT" &&
      actionList.some(
        (a) =>
          a.type === "CHANGE_GOVERNMENT" && a.nationId === newAction.nationId,
      );
    if (isDuplicateGov) {
      throw new GameError(
        "INVALID_ACTION",
        "Cannot trigger multiple government regime changes in a single turn",
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
