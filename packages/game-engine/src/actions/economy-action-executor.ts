import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { Province } from "@/domain/province/province.schema";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { DevelopmentManager } from "@/engine/economy/calculators/infrastructure-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class EconomyActionExecutor {
  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalNationId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[canonicalNationId] || state.nations[action.nationId];
    if (!nation) return state;

    switch (action.type) {
      case "SET_ECONOMIC_DOCTRINE": {
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              economicStance: action.stance,
            },
          },
        };
      }

      case "BUY_PROVINCE": {
        const province = state.provinces[action.provinceId.toString()];
        if (!province) {
          throw new GameError("INVALID_ACTION", "استان مورد نظر یافت نشد.");
        }

        const canonicalTargetId = CountryRegistry.resolveCanonicalId(
          action.targetNationId,
        );
        const seller =
          state.nations[canonicalTargetId] ||
          state.nations[action.targetNationId];

        if (!seller || !seller.isAlive) {
          throw new GameError("NATION_NOT_FOUND", "کشور مالک استان فعال نیست.");
        }

        const currentOwnerCanonical = CountryRegistry.resolveCanonicalId(
          province.ownerNationId,
        );
        if (currentOwnerCanonical !== canonicalTargetId) {
          throw new GameError(
            "INVALID_ACTION",
            "استان در حال حاضر در کنترل کشور فروشنده نیست.",
          );
        }

        if (nation.treasury < action.cost) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "موجودی خزانه برای خرید این استان کافی نیست.",
          );
        }

        const rel =
          seller.relations[canonicalNationId] || seller.relations[nation.id];
        if (rel?.stance === "WAR") {
          throw new GameError(
            "INVALID_ACTION",
            "در وضعیت جنگ امکان معامله و خرید سرزمینی وجود ندارد.",
          );
        }

        const updatedProvinces: Record<string, Province> = {
          ...state.provinces,
          [province.provinceId.toString()]: {
            ...province,
            ownerNationId: canonicalNationId,
          },
        };

        BitPackedGridState.getInstance().markDirty();

        const buyLogs = [
          TurnLogBuilder.createGlobalDiplomacyLog(
            state.currentTurn,
            nation.id,
            seller.id,
            "TERRITORY_PURCHASED",
            {
              provinceName: province.nameFa,
              cost: action.cost,
            },
            "INFO",
          ),
        ];

        return {
          ...state,
          provinces: updatedProvinces,
          turnLogs: [...state.turnLogs, ...buyLogs],
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              treasury: nation.treasury - action.cost,
            },
            [seller.id]: {
              ...seller,
              treasury: seller.treasury + action.cost,
            },
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
