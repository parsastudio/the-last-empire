import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionRuleEvaluator } from "./action-rule-evaluator";

export class StateValidator {
  public validateAction(state: GameState, action: GameAction): void {
    if (state.isGameOver) {
      throw new GameError(
        "STATE_FROZEN",
        "Cannot execute actions after game over",
      );
    }

    const sourceNation = state.nations[action.nationId];
    if (!sourceNation || !sourceNation.isAlive) {
      throw new GameError(
        "NATION_NOT_FOUND",
        `Nation ID ${action.nationId} is not alive or does not exist`,
      );
    }

    if ("targetNationId" in action && action.targetNationId) {
      const targetNation = state.nations[action.targetNationId];
      if (!targetNation || !targetNation.isAlive) {
        throw new GameError(
          "NATION_NOT_FOUND",
          `Target nation ID ${action.targetNationId} is not alive or does not exist`,
        );
      }
    }

    ActionRuleEvaluator.evaluate(state, action);
  }

  public verifyConcurrency(
    actionList: readonly GameAction[],
    newAction: GameAction,
  ): void {
    if (newAction.type === "REQUEST_LOAN") {
      if (
        actionList.some(
          (a) => a.type === "REQUEST_LOAN" && a.nationId === newAction.nationId,
        )
      ) {
        throw new GameError(
          "INVALID_ACTION",
          "Cannot request multiple loans in a single turn",
        );
      }
    }

    if (newAction.type === "TRADE_RESOURCES") {
      const hasConflict = actionList.some(
        (a) =>
          a.type === "TRADE_RESOURCES" &&
          a.nationId === newAction.nationId &&
          a.resourceType === newAction.resourceType,
      );
      if (hasConflict) {
        throw new GameError(
          "INVALID_ACTION",
          "Trade operation already queued for this resource this turn",
        );
      }
    }

    if (
      newAction.type === "INVEST_INFRASTRUCTURE" ||
      newAction.type === "UPGRADE_INDUSTRIAL_LEVEL"
    ) {
      if (
        actionList.some(
          (a) => a.type === newAction.type && a.nationId === newAction.nationId,
        )
      ) {
        throw new GameError(
          "INVALID_ACTION",
          "Upgrade already queued for this turn",
        );
      }
    }
  }
}
