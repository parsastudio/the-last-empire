import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";

export class IndustryCalculator {
  public static readonly BASE_FACTORY_YIELD = 250_000_000;
  public static readonly SUBSISTENCE_YIELD = 125_000_000;
  public static readonly YIELD_TECH_BASE = 2.4;
  public static readonly FACTORY_REBUILD_COST = 1_000_000_000;
  public static readonly RESEARCH_BASE_COST = 20_000_000_000;
  public static readonly RESEARCH_STEP = 0.1;
  public static readonly IMPORT_BASE_PRICE = 2_000_000_000;

  public static calculateFactoryYield(techLevel: number): number {
    return Math.floor(
      this.BASE_FACTORY_YIELD * Math.pow(this.YIELD_TECH_BASE, techLevel - 1),
    );
  }

  public static calculateStartingTotalFactories(
    startingGdp: number,
    industrialLevel: number,
  ): number {
    const yieldPerFactory = this.calculateFactoryYield(industrialLevel);
    return Math.max(1, Math.round(startingGdp / yieldPerFactory));
  }

  public static distributeFactoriesToProvinces(
    totalFactories: number,
    provincesCount: number,
  ): number[] {
    const safeCount = Math.max(1, provincesCount);
    const baseShare = Math.floor(totalFactories / safeCount);
    let remainder = totalFactories % safeCount;

    const distribution: number[] = [];
    for (let i = 0; i < safeCount; i++) {
      let slots = baseShare;
      if (remainder > 0) {
        slots += 1;
        remainder -= 1;
      }
      distribution.push(Math.max(1, slots));
    }
    return distribution;
  }

  public static calculateProvinceGdp(
    province: { maxSlots?: number; factoriesCount?: number },
    equipmentTechLevel = 1.0,
  ): number {
    const activeFactories = province.factoriesCount ?? 1;
    const maxSlots = province.maxSlots ?? activeFactories;
    const emptySlots = Math.max(0, maxSlots - activeFactories);

    const activeYield =
      activeFactories * this.calculateFactoryYield(equipmentTechLevel);
    const subsistenceYield = emptySlots * this.SUBSISTENCE_YIELD;

    return Math.floor(activeYield + subsistenceYield);
  }

  public static calculateModernizeUnitCost(
    equipmentTechLevel: number,
    industrialLevel: number,
  ): number {
    const gap = Math.max(0, 1 - equipmentTechLevel / industrialLevel);
    return Math.floor(1_000_000_000 * gap);
  }

  public static calculateResearchStepCost(industrialLevel: number): number {
    const k = Math.floor(industrialLevel);
    const fullTierCost = this.RESEARCH_BASE_COST * Math.pow(2.5, k - 1);
    return Math.floor(fullTierCost / 10);
  }

  public static calculateEquipmentImportPrice(
    sellerTech: number,
    buyerTech: number,
  ): number {
    const deltaT = Math.max(0, sellerTech - buyerTech);
    return Math.floor(
      this.IMPORT_BASE_PRICE * Math.pow(this.YIELD_TECH_BASE, deltaT),
    );
  }

  public static calculateNewEquipmentTechLevel(
    totalFactories: number,
    currentEquipmentTech: number,
    importedQuantity: number,
    sellerTech: number,
  ): number {
    if (totalFactories <= 0) return currentEquipmentTech;
    const safeQuantity = Math.min(
      totalFactories,
      Math.max(0, importedQuantity),
    );
    const oldPart = (totalFactories - safeQuantity) * currentEquipmentTech;
    const newPart = safeQuantity * sellerTech;
    const combined = (oldPart + newPart) / totalFactories;
    return Number(combined.toFixed(2));
  }
}
