import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceTradeExecutor } from "@/engine/actions/executors/economy/province-trade-executor";
import { NationalDebtExecutor } from "@/engine/actions/executors/economy/national-debt-executor";
import { DevelopmentUpgradeExecutor } from "@/engine/actions/executors/economy/development-upgrade-executor";

export class EconomyActionExecutor {
  public static execute(
    state: GameState,
    action: GameAction,
    sourceNation?: Nation,
    canonicalNationId?: string,
  ): GameState {
    const canonicalId =
      canonicalNationId ?? CountryRegistry.resolveCanonicalId(action.nationId);
    const nation =
      sourceNation ??
      state.nations[canonicalId] ??
      state.nations[action.nationId];

    if (!nation) {
      throw new GameError(
        "NATION_NOT_FOUND",
        `کشور صادرکننده دستور (${action.nationId}) یافت نشد.`,
      );
    }

    const buyerKey = state.nations[canonicalId] ? canonicalId : nation.id;

    switch (action.type) {
      case "SET_ECONOMIC_DOCTRINE": {
        return {
          ...state,
          nations: {
            ...state.nations,
            [buyerKey]: {
              ...nation,
              economicStance: action.stance,
            },
          },
        };
      }

      case "BUY_PROVINCE": {
        return ProvinceTradeExecutor.execute(
          state,
          action,
          nation,
          canonicalId,
          buyerKey,
        );
      }

      case "REQUEST_LOAN": {
        return NationalDebtExecutor.handleRequestLoan(
          state,
          action,
          nation,
          buyerKey,
        );
      }

      case "REPAY_DEBT": {
        return NationalDebtExecutor.handleRepayDebt(
          state,
          action,
          nation,
          buyerKey,
        );
      }

      case "UPGRADE_DEVELOPMENT": {
        return DevelopmentUpgradeExecutor.execute(
          state,
          nation,
          canonicalId,
          buyerKey,
        );
      }

      default:
        return state;
    }
  }
}
