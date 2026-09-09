import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";

export interface ModernizationInput {
  state: GameState;
  nation: Nation;
  quantity?: number;
  sourceTechLevel?: number;
  targetTech: number;
  calculateUnitCost: (sourceTech: number, targetTech: number) => number;
  errorMessagePrefix?: string;
}

export interface ModernizationResult {
  updatedProvinces: Record<string, ProvinceDynamicState>;
  updatedBatches: ProvinceDynamicState["factoryTiers"];
  newEquipTech: number;
  modernizedCount: number;
  totalCost: number;
}

export class FactoryModernizationRunner {
  public static run(input: ModernizationInput): ModernizationResult {
    const {
      state,
      nation,
      quantity,
      sourceTechLevel,
      targetTech,
      calculateUnitCost,
    } = input;

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

    if (sourceTechLevel !== undefined) {
      const roundedSource = Number(sourceTechLevel.toFixed(2));
      if (roundedSource >= targetTech) {
        throw new GameError(
          "INVALID_ACTION",
          "این رده از کارخانجات در حال حاضر در بالاترین سطح دانش قرار دارد.",
        );
      }

      const availableInTier = nationalBatches
        .filter((b) => Math.abs(b.techLevel - roundedSource) < 0.05)
        .reduce((sum, b) => sum + b.count, 0);

      if (availableInTier <= 0) {
        throw new GameError(
          "INVALID_ACTION",
          "هیچ کارخانه‌ای در رده انتخابی جهت ارتقا یافت نشد.",
        );
      }

      const qty = Math.min(availableInTier, quantity ?? availableInTier);
      const unitCost = calculateUnitCost(roundedSource, targetTech);
      const totalCost = qty * unitCost;

      if (nation.treasury < totalCost) {
        throw new GameError(
          "INSUFFICIENT_FUNDS",
          "موجودی خزانه برای نوسازی این تعداد کارخانه کافی نیست.",
        );
      }

      let provRemainingToUpgrade = qty;
      const updatedProvinces: Record<string, ProvinceDynamicState> = {
        ...state.provinces,
      };

      for (
        let i = 0;
        i < ownedProvinces.length && provRemainingToUpgrade > 0;
        i++
      ) {
        const p = ownedProvinces[i]!;
        const matchingInProv = p.factoryTiers
          .filter((t) => Math.abs(t.techLevel - roundedSource) < 0.05)
          .reduce((sum, t) => sum + t.count, 0);

        if (matchingInProv <= 0) continue;

        const takeCount = Math.min(matchingInProv, provRemainingToUpgrade);
        const nextTiers = IndustryCalculator.upgradeSpecificTier(
          p.factoryTiers,
          takeCount,
          roundedSource,
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
        updatedProvinces,
        updatedBatches,
        newEquipTech,
        modernizedCount: qty,
        totalCost,
      };
    }

    const hasUpgradableFactories = nationalBatches.some(
      (b) => b.techLevel < targetTech,
    );

    if (!hasUpgradableFactories) {
      throw new GameError(
        "INVALID_ACTION",
        "تمامی کارخانجات در حال حاضر در سطح فناوری بالاتر یا مساوی قرار دارند.",
      );
    }

    const qty = Math.min(totalFactories, quantity ?? totalFactories);

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
        const unitCost = calculateUnitCost(batch.techLevel, targetTech);
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
    const updatedProvinces: Record<string, ProvinceDynamicState> = {
      ...state.provinces,
    };

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
      updatedProvinces,
      updatedBatches,
      newEquipTech,
      modernizedCount: qty,
      totalCost,
    };
  }
}
