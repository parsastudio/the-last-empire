import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import {
  UnitType,
  MilitaryStack,
  ALL_MILITARY_UNIT_TYPES,
} from "@/domain/military/military.schema";
import { GovernmentTraitsUtility } from "@/domain/politics/government-traits.utility";
import {
  MilitaryInventoryHelper,
  MilitaryStackKey,
} from "@/domain/military/military-inventory-helper";

export class MilitaryPricingCalculator {
  public static readonly ARMS_IMPORT_BASE = 2.0;
  public static readonly MAX_ARMY_VALUATION_GDP_RATIO = 0.2;

  public static calculateUnitTypePrice(
    unitType: UnitType,
    governmentType?: string,
  ): number {
    const baseCost = MILITARY_UNIT_STATS[unitType].moneyCost;
    if (!governmentType) return baseCost;
    const modifier =
      GovernmentTraitsUtility.getModifiers(
        governmentType,
      ).procurementCostMultiplier;
    return Math.floor(baseCost * modifier);
  }

  public static calculateUnitValuation(
    unitType: UnitType,
    quantity: number,
  ): number {
    return (quantity || 0) * MILITARY_UNIT_STATS[unitType].moneyCost;
  }

  public static calculateArmsImportMultiplier(
    buyerTechLevel: number,
    sellerTechLevel: number,
  ): number {
    const buyerTech = Math.max(1.0, buyerTechLevel);
    const sellerTech = Math.max(1.0, sellerTechLevel);
    const techDelta = Math.max(0, sellerTech - buyerTech);
    const multiplier = Math.pow(this.ARMS_IMPORT_BASE, techDelta);
    return Number(multiplier.toFixed(2));
  }

  public static calculateArmsImportUnitPrice(
    unitType: UnitType,
    buyerTechLevel: number,
    sellerTechLevel: number,
  ): number {
    const basePrice = MILITARY_UNIT_STATS[unitType].moneyCost;
    const techMultiplier = this.calculateArmsImportMultiplier(
      buyerTechLevel,
      sellerTechLevel,
    );
    return Math.floor(basePrice * techMultiplier);
  }

  public static calculateTotalArmyValuation(
    military: Partial<Record<MilitaryStackKey, number>>,
  ): number {
    let total = 0;
    for (let i = 0; i < ALL_MILITARY_UNIT_TYPES.length; i++) {
      const type = ALL_MILITARY_UNIT_TYPES[i]!;
      const count = MilitaryInventoryHelper.getUnitCount(military, type);
      total += this.calculateUnitValuation(type, count);
    }
    return total;
  }

  public static calculateMaxArmyValuation(gdp: number): number {
    return Math.floor(gdp * this.MAX_ARMY_VALUATION_GDP_RATIO);
  }

  public static calculateRemainingArmyValuation(
    gdp: number,
    military: MilitaryStack,
  ): number {
    const maxValuation = this.calculateMaxArmyValuation(gdp);
    const currentValuation = this.calculateTotalArmyValuation(military);
    return Math.max(0, maxValuation - currentValuation);
  }

  public static calculateArmyCapacityRatio(
    gdp: number,
    totalValuation: number,
  ): number {
    const maxValuation = this.calculateMaxArmyValuation(gdp);
    if (maxValuation <= 0) return 100;
    return Math.min(100, Math.round((totalValuation / maxValuation) * 100));
  }
}
