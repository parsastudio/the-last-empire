import type { UnitType } from "@/domain/military/military.schema";

export interface UnitCostDetails {
  moneyCost: number;
  manpowerCost: number;
  buildTurns: number;
}

export class UnitCostCalculator {
  public getUnitDetails(
    unitType: UnitType,
    industrialLevel = 1,
  ): UnitCostDetails {
    const discount = Math.max(0.7, 1 - (industrialLevel - 1) * 0.05);

    switch (unitType) {
      case "INFANTRY":
        return {
          moneyCost: Math.floor(250000000 * discount),
          manpowerCost: 10,
          buildTurns: 2,
        };
      case "AIR_FORCE":
        return {
          moneyCost: Math.floor(1000000000 * discount),
          manpowerCost: 5,
          buildTurns: 4,
        };
      case "DRONE_MISSILE":
        return {
          moneyCost: Math.floor(1500000000 * discount),
          manpowerCost: 1,
          buildTurns: 1,
        };
      default:
        throw new Error(`Unknown unit type: ${unitType}`);
    }
  }

  public calculateTotalCost(
    unitType: UnitType,
    quantity: number,
    industrialLevel = 1,
  ): UnitCostDetails {
    const base = this.getUnitDetails(unitType, industrialLevel);
    return {
      moneyCost: base.moneyCost * quantity,
      manpowerCost: base.manpowerCost * quantity,
      buildTurns: base.buildTurns,
    };
  }
}
