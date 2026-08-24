import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { EconomyActionExecutor } from "@/engine/actions/economy-action-executor";
import { MilitaryActionExecutor } from "@/engine/actions/military-action-executor";
import { PoliticsActionExecutor } from "@/engine/actions/politics-action-executor";
import { DiplomacyLockManager } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { EspionageManager } from "@/engine/espionage/espionage-manager";

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
      state.nations[canonicalSourceId] || state.nations[action.nationId];

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
        state.nations[canonicalTargetId] ||
        state.nations[action.targetNationId];

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
      let resultData: unknown = undefined;

      switch (action.type) {
        case "SET_TAX_RATE":
        case "SET_TARIFF_RATE":
        case "REQUEST_LOAN":
        case "REPAY_DEBT":
        case "UPGRADE_DEVELOPMENT":
          newState = EconomyActionExecutor.execute(state, action);
          break;

        case "RECRUIT_UNIT":
        case "BUY_ARMS_MARKET":
        case "CANCEL_RECRUITMENT":
        case "INVEST_RESEARCH":
        case "INITIATE_BATTLE":
          newState = MilitaryActionExecutor.execute(state, action);
          break;

        case "EXECUTE_ESPIONAGE_OPERATION": {
          const espResult = EspionageManager.executeOperation(
            state,
            action.nationId,
            action.targetNationId,
            action.tier,
          );
          newState = espResult.newState;
          resultData = espResult.result;
          break;
        }

        case "UNLOCK_DOCTRINE":
        case "DIPLOMATIC_PROPOSAL":
        case "RESPOND_DIPLOMATIC_PROPOSAL": {
          const polyResult = PoliticsActionExecutor.execute(state, action);
          newState = polyResult.newState;
          resultData = polyResult.resultData;
          break;
        }

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
        resultData,
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

  public static executeBatch(
    state: GameState,
    actions: GameAction[],
    lockedDiplomacyTargets?: Set<string>,
  ): { newState: GameState; executedCount: number } {
    let workingState: GameState = {
      ...state,
      provinces: { ...state.provinces },
      nations: { ...state.nations },
      turnLogs: [...state.turnLogs],
      pendingProposals: [...state.pendingProposals],
    };

    let executedCount = 0;

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]!;
      const result = this.execute(workingState, action);

      if (result.success && result.newState) {
        workingState = result.newState;
        executedCount++;

        if (
          lockedDiplomacyTargets &&
          action.type === "DIPLOMATIC_PROPOSAL" &&
          "targetNationId" in action &&
          action.targetNationId
        ) {
          lockedDiplomacyTargets.add(
            DiplomacyLockManager.createKey(
              action.nationId,
              action.targetNationId,
            ),
          );
          lockedDiplomacyTargets.add(
            DiplomacyLockManager.createKey(
              action.targetNationId,
              action.nationId,
            ),
          );
        }
      }
    }

    return { newState: workingState, executedCount };
  }
}
