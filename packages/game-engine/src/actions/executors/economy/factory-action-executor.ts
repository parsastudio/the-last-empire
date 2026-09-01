import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";
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
    const quantity = Math.max(1, action.quantity || 1);
    const totalCost = IndustryCalculator.FACTORY_REBUILD_COST * quantity;

    if (nation.treasury < totalCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای احداث این تعداد کارخانه کافی نیست.",
      );
    }

    const canonicalNation = CountryRegistry.resolveCanonicalId(nation.id);
    const ownedProvinces: Province[] = [];

    for (const p of Object.values(state.provinces)) {
      if (
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalNation
      ) {
        ownedProvinces.push(p);
      }
    }

    if (ownedProvinces.length === 0) {
      throw new GameError(
        "PROVINCE_NOT_FOUND",
        "هیچ استانی در قلمرو این کشور یافت نشد.",
      );
    }

    const distribution = new Map<number, number>();

    if (action.provinceId) {
      const prov = state.provinces[action.provinceId.toString()];
      if (!prov) {
        throw new GameError("PROVINCE_NOT_FOUND", "استان مورد نظر یافت نشد.");
      }
      const provOwner = CountryRegistry.resolveCanonicalId(prov.ownerNationId);
      if (provOwner !== canonicalNation) {
        throw new GameError(
          "UNAUTHORIZED",
          "این استان تحت حاکمیت کشور شما قرار ندارد.",
        );
      }
      const emptySlots = Math.max(0, prov.maxSlots - prov.factoriesCount);
      if (emptySlots < quantity) {
        throw new GameError(
          "INVALID_ACTION",
          "اسلات خالی کافی در این استان برای احداث این تعداد کارخانه وجود ندارد.",
        );
      }
      distribution.set(prov.provinceId, quantity);
    } else {
      const calculatedDist = IndustryCalculator.distributeNewFactories(
        ownedProvinces,
        quantity,
      );

      let allocatedCount = 0;
      for (const added of calculatedDist.values()) {
        allocatedCount += added;
      }

      if (allocatedCount < quantity) {
        throw new GameError(
          "INVALID_ACTION",
          "مجموع اسلات‌های خالی در سراسر کشور برای احداث این تعداد کارخانه کافی نیست.",
        );
      }

      for (const [pId, added] of calculatedDist.entries()) {
        distribution.set(pId, added);
      }
    }

    const updatedProvinces: Record<string, Province> = { ...state.provinces };
    for (const [pId, added] of distribution.entries()) {
      const p = updatedProvinces[pId.toString()]!;
      const nextTiers = IndustryCalculator.addFactories(
        p.factoryTiers,
        added,
        nation.industrialLevel,
      );
      updatedProvinces[pId.toString()] = {
        ...p,
        factoriesCount: p.factoriesCount + added,
        factoryTiers: nextTiers,
      };
    }

    const updatedBatches = NationGettersUtility.getNationFactoryTiers(
      nation.id,
      updatedProvinces,
    );
    const newAverageEquipTech = IndustryCalculator.calculateWeightedAverageTech(
      updatedBatches,
      nation.industrialLevel,
    );

    return {
      ...state,
      provinces: updatedProvinces,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury - totalCost,
          factoryTiers: updatedBatches,
          equipmentTechLevel: newAverageEquipTech,
        },
      },
    };
  }

  public static executeEquipDomesticMachinery(
    state: GameState,
    action: EquipDomesticMachineryAction,
    nation: Nation,
    buyerKey: string,
  ): GameState {
    const canonicalNation = CountryRegistry.resolveCanonicalId(nation.id);
    const ownedProvinces = Object.values(state.provinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalNation,
    );

    const nationalBatches = NationGettersUtility.getNationFactoryTiers(
      nation.id,
      state.provinces,
      ownedProvinces,
    );

    const totalFactories = nationalBatches.reduce((sum, b) => sum + b.count, 0);

    if (totalFactories <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "هیچ کارخانه فعالی در کشور جهت تجهیز وجود ندارد.",
      );
    }

    const targetTech = nation.industrialLevel;
    const hasUpgradableFactories = nationalBatches.some(
      (b) => b.techLevel < targetTech,
    );

    if (!hasUpgradableFactories) {
      throw new GameError(
        "INVALID_ACTION",
        "تمامی کارخانجات کشور در حال حاضر در بالاترین سطح دانش بومی قرار دارند.",
      );
    }

    const qty = Math.min(totalFactories, action.quantity ?? totalFactories);

    let totalCost = 0;
    let remainingToUpgrade = qty;

    const sortedProvinces = [...ownedProvinces].sort((a, b) => {
      const minTechA = a.factoryTiers.length
        ? Math.min(...a.factoryTiers.map((t) => t.techLevel))
        : 1.0;
      const minTechB = b.factoryTiers.length
        ? Math.min(...b.factoryTiers.map((t) => t.techLevel))
        : 1.0;
      return minTechA - minTechB;
    });

    for (let i = 0; i < sortedProvinces.length && remainingToUpgrade > 0; i++) {
      const p = sortedProvinces[i]!;
      const consolidated = IndustryCalculator.consolidateBatches(
        p.factoryTiers,
      );

      for (let j = 0; j < consolidated.length && remainingToUpgrade > 0; j++) {
        const batch = consolidated[j]!;
        if (batch.techLevel >= targetTech) continue;

        const countToTake = Math.min(batch.count, remainingToUpgrade);
        const unitCost = IndustryCalculator.calculateModernizeUnitCost(
          batch.techLevel,
          targetTech,
        );
        totalCost += countToTake * unitCost;
        remainingToUpgrade -= countToTake;
      }
    }

    if (nation.treasury < totalCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای نوسازی این تعداد کارخانه کافی نیست.",
      );
    }

    let provRemainingToUpgrade = qty;
    const updatedProvinces: Record<string, Province> = { ...state.provinces };

    for (
      let i = 0;
      i < sortedProvinces.length && provRemainingToUpgrade > 0;
      i++
    ) {
      const p = sortedProvinces[i]!;
      const upgradableInProv = p.factoryTiers
        .filter((t) => t.techLevel < targetTech)
        .reduce((sum, t) => sum + t.count, 0);

      if (upgradableInProv <= 0) continue;

      const takeCount = Math.min(upgradableInProv, provRemainingToUpgrade);
      const nextTiers = IndustryCalculator.upgradeLowestFactories(
        p.factoryTiers,
        takeCount,
        targetTech,
      );

      updatedProvinces[p.provinceId.toString()] = {
        ...p,
        factoryTiers: nextTiers,
      };

      provRemainingToUpgrade -= takeCount;
    }

    const updatedBatches = NationGettersUtility.getNationFactoryTiers(
      nation.id,
      updatedProvinces,
    );
    const newEquipTech = IndustryCalculator.calculateWeightedAverageTech(
      updatedBatches,
      targetTech,
    );

    return {
      ...state,
      provinces: updatedProvinces,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury - totalCost,
          factoryTiers: updatedBatches,
          equipmentTechLevel: newEquipTech,
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
    const canonicalBuyer = CountryRegistry.resolveCanonicalId(buyer.id);
    const ownedProvinces = Object.values(state.provinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalBuyer,
    );

    const nationalBatches = NationGettersUtility.getNationFactoryTiers(
      buyer.id,
      state.provinces,
      ownedProvinces,
    );

    const totalBuyerFactories = nationalBatches.reduce(
      (sum, b) => sum + b.count,
      0,
    );

    if (totalBuyerFactories <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "شما کارخانه فعالی برای نصب تجهیزات وارداتی ندارید.",
      );
    }

    const hasImportableFactories = nationalBatches.some(
      (b) => b.techLevel < sellerTech,
    );

    if (!hasImportableFactories) {
      throw new GameError(
        "INVALID_ACTION",
        "سطح فناوری صنعتی فروشنده از تمام خطوط تولید فعلی شما بالاتر نیست.",
      );
    }

    const qty = Math.min(totalBuyerFactories, action.quantity);

    let totalCost = 0;
    let remainingToUpgrade = qty;
    const consolidated = IndustryCalculator.consolidateBatches(nationalBatches);

    for (let i = 0; i < consolidated.length; i++) {
      const batch = consolidated[i]!;
      if (batch.techLevel >= sellerTech || remainingToUpgrade <= 0) continue;
      const countToTake = Math.min(batch.count, remainingToUpgrade);
      const unitPrice = IndustryCalculator.calculateEquipmentImportPrice(
        sellerTech,
        batch.techLevel,
        buyer.industrialLevel,
      );
      totalCost += countToTake * unitPrice;
      remainingToUpgrade -= countToTake;
    }

    if (buyer.treasury < totalCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای واردات این حجم از ابزارآلات صنعتی کافی نیست.",
      );
    }

    let provRemainingToUpgrade = qty;
    const updatedProvinces: Record<string, Province> = { ...state.provinces };

    const sortedProvinces = [...ownedProvinces].sort((a, b) => {
      const minTechA = a.factoryTiers.length
        ? Math.min(...a.factoryTiers.map((t) => t.techLevel))
        : 1.0;
      const minTechB = b.factoryTiers.length
        ? Math.min(...b.factoryTiers.map((t) => t.techLevel))
        : 1.0;
      return minTechA - minTechB;
    });

    for (
      let i = 0;
      i < sortedProvinces.length && provRemainingToUpgrade > 0;
      i++
    ) {
      const p = sortedProvinces[i]!;
      const upgradableInProv = p.factoryTiers
        .filter((t) => t.techLevel < sellerTech)
        .reduce((sum, t) => sum + t.count, 0);

      if (upgradableInProv <= 0) continue;

      const takeCount = Math.min(upgradableInProv, provRemainingToUpgrade);
      const nextTiers = IndustryCalculator.upgradeLowestFactories(
        p.factoryTiers,
        takeCount,
        sellerTech,
      );

      updatedProvinces[p.provinceId.toString()] = {
        ...p,
        factoryTiers: nextTiers,
      };

      provRemainingToUpgrade -= takeCount;
    }

    const updatedBatches = NationGettersUtility.getNationFactoryTiers(
      buyer.id,
      updatedProvinces,
    );
    const newEquipTech = IndustryCalculator.calculateWeightedAverageTech(
      updatedBatches,
      sellerTech,
    );

    const sellerKey = state.nations[sellerCanonical]
      ? sellerCanonical
      : seller.id;

    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const isHumanBuyer = canonicalBuyer === canonicalHuman;
    const isHumanSeller = sellerCanonical === canonicalHuman;

    const logs = [];
    if (isHumanBuyer) {
      logs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          buyer.id,
          "DOMESTIC",
          "INFO",
          "ARMS_TRADE",
          {
            amount: totalCost,
            role: "BUYER",
            tradeType: "MACHINERY",
          },
          seller.id,
        ),
      );
    } else if (isHumanSeller && totalCost > 0) {
      logs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          seller.id,
          "DOMESTIC",
          "INFO",
          "ARMS_TRADE",
          {
            amount: totalCost,
            role: "SELLER",
            tradeType: "MACHINERY",
          },
          buyer.id,
        ),
      );
    }

    return {
      ...state,
      provinces: updatedProvinces,
      turnLogs: [...state.turnLogs, ...logs],
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...buyer,
          treasury: buyer.treasury - totalCost,
          factoryTiers: updatedBatches,
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
