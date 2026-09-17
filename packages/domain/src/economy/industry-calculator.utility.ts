import { FactoryBatch } from "@/domain/economy/factory-batch.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { FactoryYieldCalculatorUtility } from "@/domain/economy/factory/factory-yield-calculator.utility";
import { FactoryBatchManagerUtility } from "@/domain/economy/factory/factory-batch-manager.utility";
import { FactorySlotDistributorUtility } from "@/domain/economy/factory/factory-slot-distributor.utility";
import { FactoryDestructionResolverUtility } from "@/domain/economy/factory/factory-destruction-resolver.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

export class IndustryCalculator {
  public static readonly FACTORY_REBUILD_COST =
    FactoryYieldCalculatorUtility.FACTORY_REBUILD_COST;
  public static readonly RESEARCH_STEP =
    FactoryYieldCalculatorUtility.RESEARCH_STEP;
  public static readonly IMPORT_BASE_PRICE =
    FactoryYieldCalculatorUtility.IMPORT_BASE_PRICE;
  public static readonly IMPORT_TECH_GAP_BASE =
    FactoryYieldCalculatorUtility.IMPORT_TECH_GAP_BASE;

  public static getIndustrialFloor(industrialLevel: number): number {
    return FactoryBatchManagerUtility.getIndustrialFloor(industrialLevel);
  }

  public static applyIndustrialFloor(
    batches: FactoryBatch[] | undefined,
    industrialLevel: number,
  ): FactoryBatch[] {
    return FactoryBatchManagerUtility.applyIndustrialFloor(
      batches,
      industrialLevel,
    );
  }

  public static syncProvincesAndNationFloor(
    nationId: string,
    industrialLevel: number,
    provincesMap: Record<string, ProvinceDynamicState>,
  ): {
    updatedProvinces: Record<string, ProvinceDynamicState>;
    updatedFactoryTiers: FactoryBatch[];
    updatedEquipmentTech: number;
  } {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    const updatedProvinces: Record<string, ProvinceDynamicState> = {
      ...provincesMap,
    };
    const nationProvinces: ProvinceDynamicState[] = [];

    for (const [id, prov] of Object.entries(updatedProvinces)) {
      if (
        CountryRegistry.resolveCanonicalId(prov.ownerNationId) === canonicalId
      ) {
        const nextTiers = this.applyIndustrialFloor(
          prov.factoryTiers,
          industrialLevel,
        );
        const updatedProv: ProvinceDynamicState = {
          ...prov,
          factoryTiers: nextTiers,
        };
        updatedProvinces[id] = updatedProv;
        nationProvinces.push(updatedProv);
      }
    }

    const updatedFactoryTiers = NationGettersUtility.getNationFactoryTiers(
      nationId,
      updatedProvinces,
      nationProvinces,
    );

    const updatedEquipmentTech = this.calculateWeightedAverageTech(
      updatedFactoryTiers,
      industrialLevel,
    );

    return {
      updatedProvinces,
      updatedFactoryTiers,
      updatedEquipmentTech,
    };
  }

  public static calculateFactoryYield(techLevel: number): number {
    return FactoryYieldCalculatorUtility.calculateFactoryYield(techLevel);
  }

  public static calculateBatchesTotalYield(batches?: FactoryBatch[]): number {
    return FactoryYieldCalculatorUtility.calculateBatchesTotalYield(batches);
  }

  public static calculateStartingTotalFactories(
    startingGdp: number,
    industrialLevel: number,
  ): number {
    return FactoryYieldCalculatorUtility.calculateStartingTotalFactories(
      startingGdp,
      industrialLevel,
    );
  }

  public static calculateHeadroomRatio(
    gdpRank: number,
    totalNationsCount: number,
  ): number {
    return FactoryYieldCalculatorUtility.calculateHeadroomRatio(
      gdpRank,
      totalNationsCount,
    );
  }

  public static calculateStartingMaxSlots(
    activeFactories: number,
    gdpRank: number,
    totalNationsCount: number,
  ): number {
    return FactoryYieldCalculatorUtility.calculateStartingMaxSlots(
      activeFactories,
      gdpRank,
      totalNationsCount,
    );
  }

  public static calculateFactoryBuildCost(
    quantity = 1,
    governmentType?: string,
  ): number {
    return FactoryYieldCalculatorUtility.calculateFactoryBuildCost(
      quantity,
      governmentType,
    );
  }

  public static distributeFactoriesAndSlotsToProvinces(
    totalActiveFactories: number,
    totalMaxSlots: number,
    provincesCount: number,
  ): { activeCount: number; maxSlots: number }[] {
    return FactorySlotDistributorUtility.distributeFactoriesAndSlotsToProvinces(
      totalActiveFactories,
      totalMaxSlots,
      provincesCount,
    );
  }

  public static distributeNewFactories(
    provinces: {
      provinceId: number;
      factoriesCount: number;
      maxSlots?: number;
    }[],
    quantity: number,
  ): Map<number, number> {
    return FactorySlotDistributorUtility.distributeNewFactories(
      provinces,
      quantity,
    );
  }

  public static distributeFactoryDestruction(
    provincesMap: Record<string, ProvinceDynamicState>,
    candidateProvinces: ProvinceDynamicState[],
    factoriesToDestroy: number,
  ): {
    updatedProvinces: Record<string, ProvinceDynamicState>;
    actualDestroyed: number;
  } {
    return FactoryDestructionResolverUtility.distributeFactoryDestruction(
      provincesMap,
      candidateProvinces,
      factoriesToDestroy,
    );
  }

  public static calculateProvinceGdp(
    province: {
      maxSlots?: number;
      factoriesCount?: number;
      factoryTiers?: FactoryBatch[];
    },
    fallbackTechLevel = 1.0,
  ): number {
    return FactoryYieldCalculatorUtility.calculateProvinceGdp(
      province,
      fallbackTechLevel,
    );
  }

  public static calculateModernizeUnitCost(
    currentEquipmentTech: number,
    targetTech: number,
  ): number {
    return FactoryYieldCalculatorUtility.calculateModernizeUnitCost(
      currentEquipmentTech,
      targetTech,
    );
  }

  public static calculateEquipmentImportPrice(
    sellerIndustrialTech: number,
    batchCurrentTech: number,
    buyerDomesticIndustrialTech: number = batchCurrentTech,
  ): number {
    return FactoryYieldCalculatorUtility.calculateEquipmentImportPrice(
      sellerIndustrialTech,
      batchCurrentTech,
      buyerDomesticIndustrialTech,
    );
  }

  public static calculateResearchStepCost(
    industrialLevel: number,
    governmentType?: string,
    projectDiscountMultiplier = 1.0,
  ): number {
    return FactoryYieldCalculatorUtility.calculateResearchStepCost(
      industrialLevel,
      governmentType,
      projectDiscountMultiplier,
    );
  }

  public static consolidateBatches(batches?: FactoryBatch[]): FactoryBatch[] {
    return FactoryBatchManagerUtility.consolidateBatches(batches);
  }

  public static calculateWeightedAverageTech(
    batches?: FactoryBatch[],
    fallback = 1.0,
  ): number {
    return FactoryBatchManagerUtility.calculateWeightedAverageTech(
      batches,
      fallback,
    );
  }

  public static addFactories(
    batches: FactoryBatch[] | undefined,
    count: number,
    techLevel: number,
  ): FactoryBatch[] {
    return FactoryBatchManagerUtility.addFactories(batches, count, techLevel);
  }

  public static removeFactories(
    batches: FactoryBatch[] | undefined,
    countToRemove: number,
  ): FactoryBatch[] {
    return FactoryBatchManagerUtility.removeFactories(batches, countToRemove);
  }

  public static mergeBatches(
    batchesA?: FactoryBatch[],
    batchesB?: FactoryBatch[],
  ): FactoryBatch[] {
    return FactoryBatchManagerUtility.mergeBatches(batchesA, batchesB);
  }

  public static upgradeLowestFactories(
    batches: FactoryBatch[] | undefined,
    upgradeCount: number,
    targetTech: number,
  ): FactoryBatch[] {
    return FactoryBatchManagerUtility.upgradeLowestFactories(
      batches,
      upgradeCount,
      targetTech,
    );
  }

  public static upgradeSpecificTier(
    batches: FactoryBatch[] | undefined,
    upgradeCount: number,
    sourceTech: number,
    targetTech: number,
  ): FactoryBatch[] {
    return FactoryBatchManagerUtility.upgradeSpecificTier(
      batches,
      upgradeCount,
      sourceTech,
      targetTech,
    );
  }
}
