import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { UnitType } from "@/domain/military/military.schema";

export class MilitaryPricingCalculator {
  public static calculateTechMultiplier(techLevel: number = 1): number {
    const safeLevel = Math.max(1, techLevel);
    return 1 + (safeLevel - 1) * 0.25;
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

  public static calculateLandAndAirValuation(
    military: {
      infantry?: number;
      armor?: number;
      airDefense?: number;
      airForce?: number;
      droneMissile?: number;
      techLevel?: number;
    },
    industrialLevel: number = 1,
  ): number {
    const techLevel = military.techLevel ?? 1;
    const infPrice = this.calculateUnitTypePrice(
      "INFANTRY",
      techLevel,
      industrialLevel,
    );
    const armPrice = this.calculateUnitTypePrice(
      "ARMOR",
      techLevel,
      industrialLevel,
    );
    const adPrice = this.calculateUnitTypePrice(
      "AIR_DEFENSE",
      techLevel,
      industrialLevel,
    );
    const afPrice = this.calculateUnitTypePrice(
      "AIR_FORCE",
      techLevel,
      industrialLevel,
    );
    const drPrice = this.calculateUnitTypePrice(
      "DRONE_MISSILE",
      techLevel,
      industrialLevel,
    );

    return (
      (military.infantry || 0) * infPrice +
      (military.armor || 0) * armPrice +
      (military.airDefense || 0) * adPrice +
      (military.airForce || 0) * afPrice +
      (military.droneMissile || 0) * drPrice
    );
  }
}
