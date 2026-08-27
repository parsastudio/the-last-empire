import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { UnitType } from "@/domain/military/military.schema";

export class MilitaryPricingCalculator {
  public static calculateUnitTypePrice(unitType: UnitType): number {
    return MILITARY_UNIT_STATS[unitType].moneyCost;
  }

  public static calculateTotalCost(
    unitType: UnitType,
    quantity: number,
  ): number {
    return this.calculateUnitTypePrice(unitType) * quantity;
  }

  public static calculateMaxAffordable(
    treasury: number,
    unitPrice: number,
  ): number {
    if (unitPrice <= 0) return 0;
    return Math.floor(treasury / unitPrice);
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

  public static calculateLandAndAirValuation(military: {
    infantry?: number;
    armor?: number;
    airDefense?: number;
    airForce?: number;
    droneMissile?: number;
  }): number {
    return this.calculateTotalArmyValuation(military);
  }
}
