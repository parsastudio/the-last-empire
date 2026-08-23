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
      branchTech?: Partial<Record<string, number>>;
    },
    industrialLevel: number = 1,
  ): number {
    const fallbackTech = military.techLevel ?? 1;
    const infTech = military.branchTech?.infantry ?? fallbackTech;
    const armTech = military.branchTech?.armor ?? fallbackTech;
    const adTech = military.branchTech?.airDefense ?? fallbackTech;
    const afTech = military.branchTech?.airForce ?? fallbackTech;
    const drTech = military.branchTech?.droneMissile ?? fallbackTech;

    const infPrice = this.calculateUnitTypePrice(
      "INFANTRY",
      infTech,
      industrialLevel,
    );
    const armPrice = this.calculateUnitTypePrice(
      "ARMOR",
      armTech,
      industrialLevel,
    );
    const adPrice = this.calculateUnitTypePrice(
      "AIR_DEFENSE",
      adTech,
      industrialLevel,
    );
    const afPrice = this.calculateUnitTypePrice(
      "AIR_FORCE",
      afTech,
      industrialLevel,
    );
    const drPrice = this.calculateUnitTypePrice(
      "DRONE_MISSILE",
      drTech,
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
