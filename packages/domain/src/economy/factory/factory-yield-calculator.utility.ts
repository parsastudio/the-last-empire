import { FactoryBatch } from "@/domain/economy/factory-batch.schema";
import { GovernmentTraitsUtility } from "@/domain/politics/government-traits.utility";

export class FactoryYieldCalculatorUtility {
  public static readonly BASE_FACTORY_YIELD = 5_000_000_000;
  public static readonly YIELD_TECH_BASE = 1.5;
  public static readonly FACTORY_REBUILD_COST = 30_000_000_000;
  public static readonly RESEARCH_BASE_COST = 200_000_000_000;
  public static readonly RESEARCH_GROWTH_BASE = 2.5;
  public static readonly RESEARCH_STEP = 0.1;
  public static readonly MACHINERY_BASE_UNIT_PRICE = 10_000_000_000;
  public static readonly MAX_MODERNIZE_BASE_UNIT_COST = 120_000_000_000;
  public static readonly IMPORT_BASE_PRICE = 10_000_000_000;
  public static readonly IMPORT_TECH_GAP_BASE = 1.5;

  public static calculateFactoryYield(techLevel: number): number {
    return Math.floor(
      this.BASE_FACTORY_YIELD * Math.pow(this.YIELD_TECH_BASE, techLevel - 1),
    );
  }

  public static calculateBatchesTotalYield(batches?: FactoryBatch[]): number {
    if (!batches || batches.length === 0) return 0;
    let total = 0;
    for (let i = 0; i < batches.length; i++) {
      const b = batches[i]!;
      total += b.count * this.calculateFactoryYield(b.techLevel);
    }
    return total;
  }

  public static calculateStartingTotalFactories(
    startingGdp: number,
    industrialLevel: number,
  ): number {
    const yieldPerFactory = this.calculateFactoryYield(industrialLevel);
    return Math.max(1, Math.round(startingGdp / yieldPerFactory));
  }

  public static calculateHeadroomRatio(
    gdpRank: number,
    totalNationsCount: number,
  ): number {
    const safeTotal = Math.max(1, totalNationsCount);
    const midpoint = safeTotal / 2;
    if (gdpRank <= midpoint) {
      return 0.0;
    }
    const rankDelta = gdpRank - midpoint;
    const ratio = (rankDelta / midpoint) * 2.0;
    return Number(Math.min(2.0, Math.max(0, ratio)).toFixed(2));
  }

  public static calculateStartingMaxSlots(
    activeFactories: number,
    gdpRank: number,
    totalNationsCount: number,
  ): number {
    const headroomRatio = this.calculateHeadroomRatio(
      gdpRank,
      totalNationsCount,
    );
    const calculatedMax = Math.ceil(activeFactories * (1 + headroomRatio));
    return Math.max(activeFactories, Math.max(3, calculatedMax));
  }

  public static calculateFactoryBuildCost(
    quantity = 1,
    governmentType?: string,
  ): number {
    const modifier = governmentType
      ? GovernmentTraitsUtility.getModifiers(governmentType)
          .procurementCostMultiplier
      : 1.0;
    return Math.floor(this.FACTORY_REBUILD_COST * quantity * modifier);
  }

  public static calculateProvinceGdp(
    province: {
      maxSlots?: number;
      factoriesCount?: number;
      factoryTiers?: FactoryBatch[];
    },
    fallbackTechLevel = 1.0,
  ): number {
    if (province.factoryTiers && province.factoryTiers.length > 0) {
      return this.calculateBatchesTotalYield(province.factoryTiers);
    }
    const activeFactories = province.factoriesCount ?? 1;
    const activeYield =
      activeFactories * this.calculateFactoryYield(fallbackTechLevel);
    return Math.floor(activeYield);
  }

  public static calculateModernizeUnitCost(
    currentEquipmentTech: number,
    targetTech: number,
  ): number {
    const delta = Math.max(0, targetTech - currentEquipmentTech);
    if (delta <= 0) return 0;
    const rawCost = Math.floor(this.MACHINERY_BASE_UNIT_PRICE * delta);
    return Math.min(this.MAX_MODERNIZE_BASE_UNIT_COST, rawCost);
  }

  public static calculateEquipmentImportPrice(
    sellerIndustrialTech: number,
    batchCurrentTech: number,
    buyerDomesticIndustrialTech: number = batchCurrentTech,
  ): number {
    const upgradeDelta = Math.max(0, sellerIndustrialTech - batchCurrentTech);
    if (upgradeDelta <= 0) return 0;

    const baseUnitCost = this.calculateModernizeUnitCost(
      batchCurrentTech,
      sellerIndustrialTech,
    );

    const effectiveBaselineTech = Math.max(
      batchCurrentTech,
      buyerDomesticIndustrialTech,
    );

    const effectiveImportGap = Math.max(
      0,
      sellerIndustrialTech - effectiveBaselineTech,
    );

    const importMultiplier = Math.pow(
      this.IMPORT_TECH_GAP_BASE,
      effectiveImportGap,
    );

    return Math.floor(baseUnitCost * importMultiplier);
  }

  public static calculateResearchStepCost(
    industrialLevel: number,
    governmentType?: string,
  ): number {
    const k = Math.floor(industrialLevel);
    const fullTierCost =
      this.RESEARCH_BASE_COST * Math.pow(this.RESEARCH_GROWTH_BASE, k - 1);
    const modifier = governmentType
      ? GovernmentTraitsUtility.getModifiers(governmentType)
          .industrialResearchCostMultiplier
      : 1.0;
    return Math.floor((fullTierCost / 10) * modifier);
  }
}
