import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { Province } from "@/domain/province/province.schema";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { DevelopmentManager } from "@/engine/economy/calculators/infrastructure-manager";
import {
  getNationGdp,
  getProvinceGdp,
} from "@/domain/nation/gdp-calculator.utility";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class EconomyActionExecutor {
  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalNationId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[canonicalNationId] || state.nations[action.nationId];
    if (!nation) {
      throw new GameError(
        "NATION_NOT_FOUND",
        `کشور صادرکننده دستور (${action.nationId}) یافت نشد.`,
      );
    }

    const buyerKey = state.nations[canonicalNationId]
      ? canonicalNationId
      : nation.id;

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
        const province = state.provinces[action.provinceId.toString()];
        if (!province) {
          throw new GameError(
            "INVALID_ACTION",
            "استان مورد نظر روی نقشه یافت نشد.",
          );
        }

        const currentOwnerCanonical = CountryRegistry.resolveCanonicalId(
          province.ownerNationId,
        );

        if (currentOwnerCanonical === canonicalNationId) {
          throw new GameError(
            "INVALID_ACTION",
            "این استان در حال حاضر متعلق به خاک خود شماست.",
          );
        }

        const canonicalTargetId = CountryRegistry.resolveCanonicalId(
          action.targetNationId || province.ownerNationId,
        );

        const seller =
          state.nations[canonicalTargetId] ||
          state.nations[province.ownerNationId];

        if (!seller || !seller.isAlive) {
          throw new GameError(
            "NATION_NOT_FOUND",
            "کشور حاکم بر این استان در حال حاضر فعال نیست.",
          );
        }

        const sellerKey = state.nations[canonicalTargetId]
          ? canonicalTargetId
          : seller.id;

        const provinceGdp = getProvinceGdp(province);
        const calculatedPrice = Math.max(
          10_000_000_000,
          Math.floor(provinceGdp * 5),
        );
        const effectiveCost = action.cost > 0 ? action.cost : calculatedPrice;

        if (nation.treasury < effectiveCost) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            `موجودی خزانه برای خرید این استان کافی نیست (هزینه: ${effectiveCost.toLocaleString("en-US")} دلار).`,
          );
        }

        const rel =
          seller.relations[canonicalNationId] || seller.relations[nation.id];

        if (rel?.stance === "WAR") {
          throw new GameError(
            "INVALID_ACTION",
            `کشور ${seller.name} به دلیل وضعیت جنگی حاضر به واگذاری این استان نیست.`,
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
              cost: effectiveCost,
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
            [buyerKey]: {
              ...nation,
              treasury: nation.treasury - effectiveCost,
            },
            [sellerKey]: {
              ...seller,
              treasury: seller.treasury + effectiveCost,
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
            [buyerKey]: {
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
            [buyerKey]: {
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
            [buyerKey]: {
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
