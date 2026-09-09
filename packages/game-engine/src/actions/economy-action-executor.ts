import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { NationalDebtExecutor } from "@/engine/actions/executors/economy/national-debt-executor";
import { FactoryActionExecutor } from "@/engine/actions/executors/economy/factory-action-executor";
import { ExecutionResult } from "@/engine/actions/execution-result";

export class EconomyActionExecutor {
  public static execute(
    state: GameState,
    action: GameAction,
    sourceNation?: Nation,
    canonicalNationId?: string,
  ): ExecutionResult {
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
        const newState: GameState = {
          ...state,
          nations: {
            ...state.nations,
            [buyerKey]: {
              ...nation,
              economicStance: action.stance,
            },
          },
        };
        return {
          newState,
          resultData: { stance: action.stance },
        };
      }

      case "BUILD_FACTORY": {
        return FactoryActionExecutor.executeBuildFactory(
          state,
          action,
          nation,
          buyerKey,
        );
      }

      case "EQUIP_DOMESTIC_MACHINERY": {
        return FactoryActionExecutor.executeEquipDomesticMachinery(
          state,
          action,
          nation,
          buyerKey,
        );
      }

      case "INVEST_INDUSTRIAL_RESEARCH": {
        return FactoryActionExecutor.executeInvestIndustrialResearch(
          state,
          nation,
          buyerKey,
        );
      }

      case "BUY_INDUSTRIAL_EQUIPMENT": {
        return FactoryActionExecutor.executeBuyIndustrialEquipment(
          state,
          action,
          nation,
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

      default:
        return { newState: state };
    }
  }
}
