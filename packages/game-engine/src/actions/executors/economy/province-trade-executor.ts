import { GameState } from "@/domain/game/game-state.schema";
import { BuyProvinceAction } from "@/domain/game/action.schema";
import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { NationGettersUtility } from "@geopolitics/domain";

export class ProvinceTradeExecutor {
  public static execute(
    state: GameState,
    action: BuyProvinceAction,
    nation: Nation,
    canonicalNationId: string,
    buyerKey: string,
  ): GameState {
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
      state.nations[canonicalTargetId] || state.nations[province.ownerNationId];

    if (!seller || !seller.isAlive) {
      throw new GameError(
        "NATION_NOT_FOUND",
        "کشور حاکم بر این استان در حال حاضر فعال نیست.",
      );
    }

    const sellerProvinces = Object.values(state.provinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) ===
        canonicalTargetId,
    );

    if (sellerProvinces.length <= 1) {
      throw new GameError(
        "INVALID_ACTION",
        `امکان خرید آخرین استان کشور ${seller.name} وجود ندارد. دولت‌ها هرگز آخرین قلمرو حاکمیتی خود را واگذار نمی‌کنند.`,
      );
    }

    if (province.hasSeaAccess) {
      const sellerCoastalCount = sellerProvinces.filter(
        (p) => p.hasSeaAccess,
      ).length;
      if (sellerCoastalCount <= 1) {
        throw new GameError(
          "INVALID_ACTION",
          `امکان خرید آخرین استان ساحلی کشور ${seller.name} وجود ندارد. دولت‌ها هرگز آخرین راه ارتباطی خود به آب‌های آزاد را واگذار نمی‌کنند.`,
        );
      }
    }

    const isLandNeighbor = LandNeighborResolver.hasProvinceLandBorder(
      province.provinceId,
      nation.id,
      state.provinces,
    );
    const buyerHasSea = NationGettersUtility.hasSeaAccess(
      nation.id,
      state.provinces,
    );
    const isMaritimeAccessible = buyerHasSea && province.hasSeaAccess;

    if (!isLandNeighbor && !isMaritimeAccessible) {
      throw new GameError(
        "INVALID_ACTION",
        "عدم اتصال سرزمینی: استان هدف باید با خاک کشور شما مرز زمینی مشترک داشته باشد یا هر دو متصل به آب‌های آزاد باشند.",
      );
    }

    const sellerKey = state.nations[canonicalTargetId]
      ? canonicalTargetId
      : seller.id;

    const provinceGdp = getProvinceGdp(province);
    const multiplier = province.hasSeaAccess ? 0.75 : 0.45;
    const calculatedPrice = Math.max(
      1_000_000_000,
      Math.floor(provinceGdp * multiplier),
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
        originalNationId: canonicalNationId,
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
}
