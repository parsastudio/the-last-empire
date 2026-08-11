import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import {
  IndustrialLevelManager,
  InfrastructureManager,
} from "@/engine/economy/economy-calculators";

export class EconomyActionExecutor {
  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalNationId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[action.nationId] || state.nations[canonicalNationId];
    if (!nation) return state;

    switch (action.type) {
      case "SET_TAX_RATE": {
        if (action.newRate < 0 || action.newRate > 50) {
          throw new GameError(
            "INVALID_ACTION",
            "نرخ مالیات باید بین ۰ تا ۵۰ درصد باشد.",
          );
        }
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              taxRate: action.newRate,
            },
          },
        };
      }

      case "SET_TARIFF_RATE": {
        if (action.newRate < 0 || action.newRate > 100) {
          throw new GameError(
            "INVALID_ACTION",
            "نرخ تعرفه گمرک باید بین ۰ تا ۱۰۰ درصد باشد.",
          );
        }
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: { ...nation, tariffRate: action.newRate },
          },
        };
      }

      case "REQUEST_LOAN": {
        if (action.amount <= 0) {
          throw new GameError(
            "INVALID_ACTION",
            "مبلغ وام باید بزرگتر از صفر باشد.",
          );
        }
        const maxManualDebtLimit = Math.floor(nation.gdp * 0.8);
        if (nation.nationalDebt + action.amount > maxManualDebtLimit) {
          throw new GameError(
            "INVALID_ACTION",
            "سقف مجاز وام دستی (۸۰٪ تولید ناخالص داخلی) تکمیل شده است.",
          );
        }
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              treasury: nation.treasury + action.amount,
              nationalDebt: nation.nationalDebt + action.amount,
            },
          },
        };
      }

      case "REPAY_DEBT": {
        if (action.amount <= 0) {
          throw new GameError(
            "INVALID_ACTION",
            "مبلغ تسویه باید بزرگتر از صفر باشد.",
          );
        }
        if (nation.nationalDebt <= 0) {
          throw new GameError("INVALID_ACTION", "هیچ بدهی معوقی وجود ندارد.");
        }
        if (nation.treasury < action.amount) {
          throw new GameError("INSUFFICIENT_FUNDS", "موجودی خزانه کافی نیست.");
        }
        const repayAmount = Math.min(action.amount, nation.nationalDebt);
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              treasury: nation.treasury - repayAmount,
              nationalDebt: nation.nationalDebt - repayAmount,
            },
          },
        };
      }

      case "INVEST_INFRASTRUCTURE": {
        const cost = InfrastructureManager.getUpgradeCost(nation);
        if (nation.treasury < cost) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "موجودی خزانه برای ارتقای زیرساخت کافی نیست.",
          );
        }
        const nextCapacity =
          InfrastructureManager.calculateNextCapacityOnUpgrade(
            nation.maxPopulationCapacity ||
              Math.floor(nation.population / 0.95),
          );
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              treasury: nation.treasury - cost,
              maxPopulationCapacity: nextCapacity,
              geography: {
                ...nation.geography,
                infrastructureLevel: nation.geography.infrastructureLevel + 1,
              },
            },
          },
        };
      }

      case "UPGRADE_INDUSTRIAL_LEVEL": {
        const cost = IndustrialLevelManager.getUpgradeCost(nation);
        if (nation.treasury < cost) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "موجودی خزانه برای ارتقای سطح صنعت کافی نیست.",
          );
        }
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              treasury: nation.treasury - cost,
              industrialLevel: nation.industrialLevel + 1,
            },
          },
        };
      }

      default:
        return state;
    }
  }
}
