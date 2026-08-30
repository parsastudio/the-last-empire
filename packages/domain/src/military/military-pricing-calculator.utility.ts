import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { UnitType } from "@/domain/military/military.schema";

export class MilitaryPricingCalculator {
  public static readonly MAX_IMPORT_TECH_MULTIPLIER = 3.0;
  public static readonly TECH_STEP_SURCHARGE_RATE = 0.05;

  public static calculateUnitTypePrice(unitType: UnitType): number {
    return MILITARY_UNIT_STATS[unitType].moneyCost;
  }

  public static calculateUnitValuation(
    unitType: UnitType,
    quantity: number,
  ): number {
    return (quantity || 0) * this.calculateUnitTypePrice(unitType);
  }

  public static calculateArmsImportMultiplier(
    buyerTechLevel: number,
    sellerTechLevel: number,
  ): number {
    const buyerTech = Math.max(1.0, buyerTechLevel);
    const sellerTech = Math.max(1.0, sellerTechLevel);
    const techDelta = Math.max(0, sellerTech - buyerTech);
    const steps = Math.round(techDelta * 10);
    const multiplier = 1.0 + steps * this.TECH_STEP_SURCHARGE_RATE;
    return Number(
      Math.min(
        this.MAX_IMPORT_TECH_MULTIPLIER,
        Math.max(1.0, multiplier),
      ).toFixed(2),
    );
  }

  public static calculateArmsImportUnitPrice(
    unitType: UnitType,
    buyerTechLevel: number,
    sellerTechLevel: number,
  ): number {
    const basePrice = this.calculateUnitTypePrice(unitType);
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
