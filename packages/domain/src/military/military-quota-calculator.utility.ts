import {
  UnitType,
  MilitaryStack,
  ALL_MILITARY_UNIT_TYPES,
} from "@/domain/military/military.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

export interface UnitBudgetQuota {
  unitType: UnitType;
  ratio: number;
  maxUnits: number;
  currentUnits: number;
  remainingRoom: number;
  unitPrice: number;
}

export class MilitaryQuotaCalculator {
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
    return MilitaryInventoryHelper.getUnitCount(military, unitType);
  }

  public static calculateQuotas(
    gdp: number,
    military: MilitaryStack,
  ): Record<UnitType, UnitBudgetQuota> {
    const ratios = this.getUnitRatios();
    const result: Partial<Record<UnitType, UnitBudgetQuota>> = {};

    const maxGlobalValuation =
      MilitaryPricingCalculator.calculateMaxArmyValuation(gdp);
    const remainingGlobalValuation =
      MilitaryPricingCalculator.calculateRemainingArmyValuation(gdp, military);

    for (let i = 0; i < ALL_MILITARY_UNIT_TYPES.length; i++) {
      const type = ALL_MILITARY_UNIT_TYPES[i]!;
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
