import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { EconomyActionExecutor } from "@/engine/actions/economy-action-executor";
import { MilitaryActionExecutor } from "@/engine/actions/military-action-executor";
import { PoliticsActionExecutor } from "@/engine/actions/politics-action-executor";

export class ActionEngine {
  public static execute(state: GameState, action: GameAction): ActionResult {
    const targetActionId = action.id;

    if (state.isGameOver) {
      return {
        success: false,
        actionId: targetActionId,
        message: "دستور رد شد: بازی به پایان رسیده است.",
        error: "GAME_OVER",
      };
    }

    const canonicalSourceId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const sourceNation =
      state.nations[action.nationId] || state.nations[canonicalSourceId];

    if (!sourceNation || !sourceNation.isAlive) {
      return {
        success: false,
        actionId: targetActionId,
        message: `کشور صادرکننده دستور (${action.nationId}) فعال نیست.`,
        error: "NATION_NOT_FOUND",
      };
    }

    if ("targetNationId" in action && action.targetNationId) {
      const canonicalTargetId = CountryRegistry.resolveCanonicalId(
        action.targetNationId,
      );
      const targetNation =
        state.nations[action.targetNationId] ||
        state.nations[canonicalTargetId];

      if (!targetNation || !targetNation.isAlive) {
        return {
          success: false,
          actionId: targetActionId,
          message: `کشور هدف دستور (${action.targetNationId}) یافت نشد.`,
          error: "NATION_NOT_FOUND",
        };
      }
    }

    try {
      let newState: GameState = state;

      switch (action.type) {
        case "SET_TAX_RATE":
        case "SET_TARIFF_RATE":
        case "REQUEST_LOAN":
        case "REPAY_DEBT":
        case "INVEST_INFRASTRUCTURE":
        case "UPGRADE_INDUSTRIAL_LEVEL":
          newState = EconomyActionExecutor.execute(state, action);
          break;

        case "RECRUIT_UNIT":
        case "BUY_ARMS_MARKET":
        case "CANCEL_RECRUITMENT":
        case "INVEST_RESEARCH":
        case "INITIATE_BATTLE":
          newState = MilitaryActionExecutor.execute(state, action);
          break;

        case "UNLOCK_DOCTRINE":
        case "EXECUTE_ESPIONAGE_OPERATION":
        case "DIPLOMATIC_PROPOSAL":
          newState = PoliticsActionExecutor.execute(state, action);
          break;

        default:
          return {
            success: false,
            actionId: targetActionId,
            message: "دستور ناشناخته است.",
            error: "UNKNOWN_ACTION",
          };
      }

      return {
        success: true,
        actionId: targetActionId,
        message: "دستور با موفقیت اجرا شد.",
        newState,
      };
    } catch (err) {
      const errorMsg =
        err instanceof GameError
          ? err.message
          : err instanceof Error
            ? err.message
            : "خطا در اجرای دستور";

      return {
        success: false,
        actionId: targetActionId,
        message: errorMsg,
        error: "EXECUTION_FAILED",
      };
    }
  }
}
