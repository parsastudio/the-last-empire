import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { Province } from "@/domain/province/province.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { DevelopmentManager } from "@/engine/economy/calculators/infrastructure-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export class EconomyActionExecutor {
  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalNationId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[canonicalNationId] || state.nations[action.nationId];
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
        if (action.newRate < 0 || action.newRate > 50) {
          throw new GameError(
            "INVALID_ACTION",
            "نرخ تعرفه گمرک باید بین ۰ تا ۵۰ درصد باشد.",
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
        const maxManualDebtLimit = Math.floor(
          getNationGdp(nation, state.provinces) * 0.8,
        );
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

      case "UPGRADE_DEVELOPMENT": {
        const cost = DevelopmentManager.getUpgradeCost(
          getNationGdp(nation, state.provinces),
        );
        if (nation.treasury < cost) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "موجودی خزانه برای اجرای طرح جامع توسعه ملی کافی نیست.",
          );
        }

        const updatedProvinces: Record<string, Province> = {
          ...state.provinces,
        };

        for (const prov of Object.values(state.provinces)) {
          const canonicalOwner = CountryRegistry.resolveCanonicalId(
            prov.ownerNationId,
          );
          if (canonicalOwner === canonicalNationId) {
            const nextCap = DevelopmentManager.calculateNextCapacity(
              prov.maxPopulationCapacity,
            );
            const nextProd = DevelopmentManager.calculateNextProductivity(
              prov.perCapitaProductivity,
            );
            const updatedProv: Province = {
              ...prov,
              maxPopulationCapacity: nextCap,
              perCapitaProductivity: nextProd,
            };
            updatedProvinces[prov.provinceId.toString()] = updatedProv;
          }
        }

        const nextLevel = nation.industrialLevel + 1;

        return {
          ...state,
          provinces: updatedProvinces,
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              treasury: nation.treasury - cost,
              industrialLevel: nextLevel,
            },
          },
        };
      }

      default:
        return state;
    }
  }
}
