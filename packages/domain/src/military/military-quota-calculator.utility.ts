import { UnitType, MilitaryStack } from "@/domain/military/military.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";

export interface UnitBudgetQuota {
  unitType: UnitType;
  ratio: number;
  maxUnits: number;
  currentUnits: number;
  remainingRoom: number;
  unitPrice: number;
}

export class MilitaryQuotaCalculator {
  public static readonly MAX_VALUATION_GDP_RATIO = 0.2;

  public static getUnitRatios(): Record<UnitType, number> {
    return {
      ARMOR: 0.3,
      AIR_FORCE: 0.3,
      INFANTRY: 0.15,
      AIR_DEFENSE: 0.15,
      DRONE_MISSILE: 0.1,
    };
  }

  public static getUnitCurrentCount(
    military: MilitaryStack,
    unitType: UnitType,
  ): number {
    switch (unitType) {
      case "INFANTRY":
        return military.infantry || 0;
      case "ARMOR":
        return military.armor || 0;
      case "AIR_DEFENSE":
        return military.airDefense || 0;
      case "AIR_FORCE":
        return military.airForce || 0;
      case "DRONE_MISSILE":
        return military.droneMissile || 0;
    }
  }

  public static calculateQuotas(
    gdp: number,
    military: MilitaryStack,
  ): Record<UnitType, UnitBudgetQuota> {
    const ratios = this.getUnitRatios();
    const result: Partial<Record<UnitType, UnitBudgetQuota>> = {};

    const types: UnitType[] = [
      "INFANTRY",
      "ARMOR",
      "AIR_DEFENSE",
      "AIR_FORCE",
      "DRONE_MISSILE",
    ];

    const totalValuation =
      MilitaryPricingCalculator.calculateTotalArmyValuation(military);
    const maxGlobalValuation = Math.floor(gdp * this.MAX_VALUATION_GDP_RATIO);
    const remainingGlobalValuation = Math.max(
      0,
      maxGlobalValuation - totalValuation,
    );

    for (let i = 0; i < types.length; i++) {
      const type = types[i]!;
      const ratio = ratios[type] || 0;
      const unitPrice = MILITARY_UNIT_STATS[type].moneyCost;
      const budgetCap = Math.floor(maxGlobalValuation * ratio);
      const maxUnits = unitPrice > 0 ? Math.floor(budgetCap / unitPrice) : 0;
      const currentUnits = this.getUnitCurrentCount(military, type);
      const remainingQuotaRoom = Math.max(0, maxUnits - currentUnits);
      const maxGlobalUnits =
        unitPrice > 0 ? Math.floor(remainingGlobalValuation / unitPrice) : 0;
      const remainingRoom = Math.min(remainingQuotaRoom, maxGlobalUnits);

      result[type] = {
        unitType: type,
        ratio,
        maxUnits,
        currentUnits,
        remainingRoom,
        unitPrice,
      };
    }

    return result as Record<UnitType, UnitBudgetQuota>;
  }
}
