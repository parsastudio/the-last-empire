import type { UnitType } from "@/domain/military/military.schema";

export interface UnitCostDetails {
  moneyCost: number;
  manpowerCost: number;
  buildTurns: number;
}

export class UnitCostCalculator {
  public getUnitDetails(
    unitType: UnitType,
    _industrialLevel: number,
  ): UnitCostDetails {
    switch (unitType) {
      case "INFANTRY":
        return {
          moneyCost: 250000000,
          manpowerCost: 10,
          buildTurns: 2,
        };
      case "AIR_FORCE":
        return {
          moneyCost: 1000000000,
          manpowerCost: 5,
          buildTurns: 4,
        };
      case "DRONE_MISSILE":
        return {
          moneyCost: 1500000000,
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
    industrialLevel: number,
  ): UnitCostDetails {
    const base = this.getUnitDetails(unitType, industrialLevel);
    return {
      moneyCost: base.moneyCost * quantity,
      manpowerCost: base.manpowerCost * quantity,
      buildTurns: base.buildTurns,
    };
  }
}
