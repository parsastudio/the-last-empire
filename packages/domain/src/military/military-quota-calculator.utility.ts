import {
  UnitType,
  MilitaryStack,
  RecruitmentOrder,
} from "@/domain/military/military.schema";
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
    recruitmentQueue: RecruitmentOrder[] = [],
  ): number {
    let count = 0;
    switch (unitType) {
      case "INFANTRY":
        count = military.infantry || 0;
        break;
      case "ARMOR":
        count = military.armor || 0;
        break;
      case "AIR_DEFENSE":
        count = military.airDefense || 0;
        break;
      case "AIR_FORCE":
        count = military.airForce || 0;
        break;
      case "DRONE_MISSILE":
        count = military.droneMissile || 0;
        break;
    }

    for (let i = 0; i < recruitmentQueue.length; i++) {
      if (recruitmentQueue[i]!.unitType === unitType) {
        count += recruitmentQueue[i]!.quantity;
      }
    }

    return count;
  }

  public static calculateQuotas(
    gdp: number,
    military: MilitaryStack,
    recruitmentQueue: RecruitmentOrder[] = [],
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

    const currentTotalValuation =
      MilitaryPricingCalculator.calculateTotalArmyValuation(military);

    let queuedCost = 0;
    for (let i = 0; i < recruitmentQueue.length; i++) {
      queuedCost += recruitmentQueue[i]!.totalCost;
    }

    const totalValuation = currentTotalValuation + queuedCost;
    const maxGlobalValuation = Math.floor(gdp);
    const remainingGlobalValuation = Math.max(
      0,
      maxGlobalValuation - totalValuation,
    );

    for (let i = 0; i < types.length; i++) {
      const type = types[i]!;
      const ratio = ratios[type] || 0;
      const unitPrice = MILITARY_UNIT_STATS[type].moneyCost;
      const budgetCap = Math.floor(gdp * ratio);
      const maxUnits = unitPrice > 0 ? Math.floor(budgetCap / unitPrice) : 0;
      const currentUnits = this.getUnitCurrentCount(
        military,
        type,
        recruitmentQueue,
      );
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
