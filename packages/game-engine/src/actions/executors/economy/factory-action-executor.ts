import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import {
  BuildFactoryAction,
  EquipDomesticMachineryAction,
  InvestIndustrialResearchAction,
  BuyIndustrialEquipmentAction,
} from "@/domain/game/action.schema";

export class FactoryActionExecutor {
  public static executeBuildFactory(
    state: GameState,
    action: BuildFactoryAction,
    nation: Nation,
    buyerKey: string,
  ): GameState {
    const cost = IndustryCalculator.FACTORY_REBUILD_COST;
    if (nation.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای بازسازی کارخانه کافی نیست (۱ میلیارد دلار نیاز است).",
      );
    }

    const prov = state.provinces[action.provinceId.toString()];
    if (!prov) {
      throw new GameError("PROVINCE_NOT_FOUND", "استان مورد نظر یافت نشد.");
    }

    const provOwner = CountryRegistry.resolveCanonicalId(prov.ownerNationId);
    const canonicalNation = CountryRegistry.resolveCanonicalId(nation.id);
    if (provOwner !== canonicalNation) {
      throw new GameError(
        "UNAUTHORIZED",
        "این استان تحت حاکمیت کشور شما قرار ندارد.",
      );
    }

    const emptySlots = Math.max(0, prov.maxSlots - prov.factoriesCount);
    if (emptySlots <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "تمامی اسلات‌های کارخانه این استان فعال بوده و اسلات خالی جهت ساخت وجود ندارد.",
      );
    }

    const updatedProv: Province = {
      ...prov,
      factoriesCount: prov.factoriesCount + 1,
    };

    return {
      ...state,
      provinces: {
        ...state.provinces,
        [prov.provinceId.toString()]: updatedProv,
      },
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury - cost,
        },
      },
    };
  }

  public static executeEquipDomesticMachinery(
    state: GameState,
    nation: Nation,
    buyerKey: string,
  ): GameState {
    const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
    let totalFactories = 0;
    for (const p of Object.values(state.provinces)) {
      if (CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId) {
        totalFactories += p.factoriesCount;
      }
    }

    if (totalFactories <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "هیچ کارخانه فعالی در کشور جهت تجهیز وجود ندارد.",
      );
    }

    const unitCost = IndustryCalculator.calculateModernizeUnitCost(
      nation.equipmentTechLevel,
      nation.industrialLevel,
    );
    const totalCost = totalFactories * unitCost;

    if (totalCost <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "تجهیزات کارخانجات شما در حال حاضر در بالاترین سطح دانش بومی کشور قرار دارد.",
      );
    }

    if (nation.treasury < totalCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای نوسازی بومی تمامی خطوط تولید کارخانجات کافی نیست.",
      );
    }

    return {
      ...state,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury - totalCost,
          equipmentTechLevel: nation.industrialLevel,
        },
      },
    };
  }

  public static executeInvestIndustrialResearch(
    state: GameState,
    nation: Nation,
    buyerKey: string,
  ): GameState {
    const cost = IndustryCalculator.calculateResearchStepCost(
      nation.industrialLevel,
    );
    if (nation.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای پژوهش صنعتی بومی کافی نیست.",
      );
    }

    const nextIndustrialLevel = Number(
      (nation.industrialLevel + IndustryCalculator.RESEARCH_STEP).toFixed(2),
    );

    return {
      ...state,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury - cost,
          industrialLevel: nextIndustrialLevel,
        },
      },
    };
  }

  public static executeBuyIndustrialEquipment(
    state: GameState,
    action: BuyIndustrialEquipmentAction,
    buyer: Nation,
    buyerKey: string,
  ): GameState {
    const sellerCanonical = CountryRegistry.resolveCanonicalId(
      action.sellerNationId,
    );
    const seller =
      state.nations[sellerCanonical] || state.nations[action.sellerNationId];

    if (!seller || !seller.isAlive) {
      throw new GameError(
        "SELLER_NOT_FOUND",
        "کشور فروشنده تجهیزات صنعتی در دسترس نیست.",
      );
    }

    const rel =
      buyer.relations[sellerCanonical] ||
      buyer.relations[action.sellerNationId];
    if (rel?.stance === "WAR" || (rel?.tension ?? 10) >= 50) {
      throw new GameError(
        "DIPLOMATIC_TENSION",
        "به دلیل تنش دیپلماتیک یا جنگ، امکان معامله صنعتی با این کشور وجود ندارد.",
      );
    }

    const sellerTech = seller.industrialLevel;
    if (sellerTech <= buyer.equipmentTechLevel) {
      throw new GameError(
        "INVALID_ACTION",
        "سطح فناوری صنعتی فروشنده از تجهیزات فعلی شما بالاتر نیست.",
      );
    }

    const unitPrice = IndustryCalculator.calculateEquipmentImportPrice(
      sellerTech,
      buyer.equipmentTechLevel,
    );
    const totalCost = action.quantity * unitPrice;

    if (buyer.treasury < totalCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای واردات این حجم از ابزارآلات صنعتی کافی نیست.",
      );
    }

    const canonicalBuyer = CountryRegistry.resolveCanonicalId(buyer.id);
    let totalBuyerFactories = 0;
    for (const p of Object.values(state.provinces)) {
      if (
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalBuyer
      ) {
        totalBuyerFactories += p.factoriesCount;
      }
    }

    if (totalBuyerFactories <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "شما کارخانه فعالی برای نصب تجهیزات وارداتی ندارید.",
      );
    }

    const newEquipTech = IndustryCalculator.calculateNewEquipmentTechLevel(
      totalBuyerFactories,
      buyer.equipmentTechLevel,
      action.quantity,
      sellerTech,
    );

    const sellerKey = state.nations[sellerCanonical]
      ? sellerCanonical
      : seller.id;

    return {
      ...state,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...buyer,
          treasury: buyer.treasury - totalCost,
          equipmentTechLevel: newEquipTech,
        },
        [sellerKey]: {
          ...seller,
          treasury: seller.treasury + totalCost,
        },
      },
    };
  }
}
