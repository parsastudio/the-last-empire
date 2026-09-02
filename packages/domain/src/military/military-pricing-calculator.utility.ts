import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { UnitType } from "@/domain/military/military.schema";
import { GovernmentTraitsUtility } from "@/domain/politics/government-traits.utility";

export class MilitaryPricingCalculator {
  public static readonly ARMS_IMPORT_BASE = 2.0;

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

  public static calculateTotalArmyValuation(military: {
    infantry?: number;
    armor?: number;
    airDefense?: number;
    airForce?: number;
    droneMissile?: number;
  }): number {
    return (
      (military.infantry || 0) * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      (military.armor || 0) * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      (military.airDefense || 0) * MILITARY_UNIT_STATS.AIR_DEFENSE.moneyCost +
      (military.airForce || 0) * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      (military.droneMissile || 0) * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost
    );
  }
}
