import {
  UnitType,
  MilitaryStack,
  RecruitmentOrder,
} from "@/domain/military/military.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export interface UnitBudgetQuota {
  unitType: UnitType;
  ratio: number;
  maxUnits: number;
  currentUnits: number;
  remainingRoom: number;
  unitPrice: number;
}

export class MilitaryQuotaCalculator {
  public static getUnitRatios(
    techLevel: number,
    hasSeaAccess: boolean = true,
  ): Record<UnitType, number> {
    const baseLevel = Math.floor(Math.max(1, techLevel));

    switch (baseLevel) {
      case 1:
        return {
          INFANTRY: 0.8,
          DRONE_MISSILE: 0.2,
          ARMOR: 0.0,
          AIR_DEFENSE: 0.0,
          AIR_FORCE: 0.0,
          NAVAL_FLEET: 0.0,
        };
      case 2:
        return {
          INFANTRY: 0.45,
          ARMOR: 0.45,
          DRONE_MISSILE: 0.1,
          AIR_DEFENSE: 0.0,
          AIR_FORCE: 0.0,
          NAVAL_FLEET: 0.0,
        };
      case 3:
        return {
          ARMOR: 0.35,
          INFANTRY: 0.3,
          AIR_DEFENSE: 0.25,
          DRONE_MISSILE: 0.1,
          AIR_FORCE: 0.0,
          NAVAL_FLEET: 0.0,
        };
      case 4:
        return {
          ARMOR: 0.3,
          AIR_FORCE: 0.25,
          INFANTRY: 0.2,
          AIR_DEFENSE: 0.15,
          DRONE_MISSILE: 0.1,
          NAVAL_FLEET: 0.0,
        };
      case 5:
      default:
        if (hasSeaAccess) {
          return {
            ARMOR: 0.25,
            AIR_FORCE: 0.2,
            INFANTRY: 0.15,
            AIR_DEFENSE: 0.15,
            NAVAL_FLEET: 0.15,
            DRONE_MISSILE: 0.1,
          };
        }
        return {
          ARMOR: 0.3,
          AIR_FORCE: 0.3,
          INFANTRY: 0.15,
          AIR_DEFENSE: 0.15,
          DRONE_MISSILE: 0.1,
          NAVAL_FLEET: 0.0,
        };
    }
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
      case "NAVAL_FLEET":
        count = military.navalFleet || 0;
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
    hasSeaAccess: boolean = true,
    recruitmentQueue: RecruitmentOrder[] = [],
  ): Record<UnitType, UnitBudgetQuota> {
    const ratios = this.getUnitRatios(military.techLevel, hasSeaAccess);
    const result: Partial<Record<UnitType, UnitBudgetQuota>> = {};

    const types: UnitType[] = [
      "INFANTRY",
      "ARMOR",
      "AIR_DEFENSE",
      "AIR_FORCE",
      "DRONE_MISSILE",
      "NAVAL_FLEET",
    ];

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
      const remainingRoom = Math.max(0, maxUnits - currentUnits);

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
