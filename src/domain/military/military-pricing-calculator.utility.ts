import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { UnitType } from "@/domain/military/military.schema";

export class MilitaryPricingCalculator {
  public static calculateTechMultiplier(techLevel: number = 1): number {
    return 1 + (techLevel - 1) * 0.05;
  }

  public static calculateIndustrialDiscount(
    industrialLevel: number = 1,
  ): number {
    return Math.max(0.7, 1 - (industrialLevel - 1) * 0.05);
  }

  public static calculateUnitPrice(
    baseCost: number,
    techLevel: number = 1,
    industrialLevel: number = 1,
  ): number {
    const techMultiplier = this.calculateTechMultiplier(techLevel);
    const discount = this.calculateIndustrialDiscount(industrialLevel);
    return Math.floor(baseCost * techMultiplier * discount);
  }

  public static calculateUnitTypePrice(
    unitType: UnitType,
    techLevel: number = 1,
    industrialLevel: number = 1,
  ): number {
    const stats = MILITARY_UNIT_STATS[unitType];
    return this.calculateUnitPrice(stats.moneyCost, techLevel, industrialLevel);
  }

  public static calculateTotalCost(
    unitType: UnitType,
    quantity: number,
    techLevel: number = 1,
    industrialLevel: number = 1,
  ): number {
    const unitPrice = this.calculateUnitTypePrice(
      unitType,
      techLevel,
      industrialLevel,
    );
    return unitPrice * quantity;
  }

  public static calculateMaxAffordable(
    treasury: number,
    unitPrice: number,
  ): number {
    if (unitPrice <= 0) return 0;
    return Math.floor(treasury / unitPrice);
  }
}
