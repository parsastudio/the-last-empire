import { GameState } from "@/domain/game/game-state.schema";
import { BuyProvinceAction } from "@/domain/game/action.schema";
import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import {
  NationGettersUtility,
  DebtCalculatorUtility,
  ProvinceTradeValidator,
  IndustryCalculator,
  getNationGdp,
} from "@geopolitics/domain";

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

    const validation = ProvinceTradeValidator.validate(
      nation,
      seller,
      province,
      state.provinces,
      state.nations,
    );

    if (!validation.isValid) {
      throw new GameError(
        "INVALID_ACTION",
        validation.reason || "امکان خرید این استان با شرایط فعلی وجود ندارد.",
      );
    }

    const sellerKey = state.nations[canonicalTargetId]
      ? canonicalTargetId
      : seller.id;

    const sellerProvinces = Object.values(state.provinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) ===
        canonicalTargetId,
    );

    const totalSellerGdpBefore = getNationGdp(
      seller,
      state.provinces,
      sellerProvinces,
    );

    const effectiveCost =
      action.cost > 0 ? action.cost : validation.purchasePrice;

    const debtRelief = DebtCalculatorUtility.calculateProportionalDebtRelief(
      seller.nationalDebt,
      validation.provinceGdp,
      totalSellerGdpBefore,
    );

    const flooredProvTiers = IndustryCalculator.applyIndustrialFloor(
      province.factoryTiers,
      nation.industrialLevel,
    );

    const updatedProvinces: Record<string, Province> = {
      ...state.provinces,
      [province.provinceId.toString()]: {
        ...province,
        ownerNationId: canonicalNationId,
        originalNationId: canonicalNationId,
        factoryTiers: flooredProvTiers,
      },
    };

    BitPackedGridState.getInstance().markDirty();

    const rawBuyerBatches = NationGettersUtility.getNationFactoryTiers(
      nation.id,
      updatedProvinces,
    );
    const updatedBuyerBatches = IndustryCalculator.applyIndustrialFloor(
      rawBuyerBatches,
      nation.industrialLevel,
    );
    const updatedBuyerEquipTech =
      IndustryCalculator.calculateWeightedAverageTech(
        updatedBuyerBatches,
        nation.industrialLevel,
      );

    const updatedSellerBatches = NationGettersUtility.getNationFactoryTiers(
      seller.id,
      updatedProvinces,
    );
    const updatedSellerEquipTech = NationGettersUtility.getNationEquipmentTech(
      seller.id,
      updatedProvinces,
      seller.industrialLevel,
    );

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
          hasBoughtProvinceThisTurn: true,
          factoryTiers: updatedBuyerBatches,
          equipmentTechLevel: updatedBuyerEquipTech,
        },
        [sellerKey]: {
          ...seller,
          treasury: seller.treasury + effectiveCost,
          nationalDebt: Math.max(0, seller.nationalDebt - debtRelief),
          factoryTiers: updatedSellerBatches,
          equipmentTechLevel: updatedSellerEquipTech,
        },
      },
    };
  }
}
