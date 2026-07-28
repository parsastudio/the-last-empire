import type { UnitType } from "@/domain/military/military.schema";

export interface UnitCostDetails {
  moneyCost: number;
  manpowerCost: number;
  buildTurns: number;
}

export class UnitCostCalculator {
  public getUnitDetails(
    unitType: UnitType,
    industrialLevel: number,
  ): UnitCostDetails {
    const timeReduction = Math.max(0, Math.floor((industrialLevel - 1) / 2));

    switch (unitType) {
      case "INFANTRY":
        return {
          moneyCost: 100,
          manpowerCost: 10,
          buildTurns: Math.max(1, 2 - timeReduction),
        };
      case "AIR_FORCE":
        return {
          moneyCost: 500,
          manpowerCost: 5,
          buildTurns: Math.max(1, 4 - timeReduction),
        };
      case "DRONE_MISSILE":
        return {
          moneyCost: 1200,
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
