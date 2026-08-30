import {
  Nation,
  UnitType,
  MilitaryInventoryHelper,
  MilitaryPowerCalculator,
} from "@geopolitics/domain";

export interface NationCombatUnitMultipliers {
  infantry: number;
  armor: number;
  airDefense: number;
  airForce: number;
  droneMissile: number;
}

export class CombatModifierResolver {
  public static calculateDeploymentCosts(forceCost: number): {
    moneyCost: number;
  } {
    return { moneyCost: Math.floor(forceCost * 0.05) };
  }

  public static getUnitMultiplier(nation: Nation, unitType: UnitType): number {
    const branchTech = MilitaryInventoryHelper.getBranchTech(
      nation.military,
      unitType,
    );
    return MilitaryPowerCalculator.calculateTechMultiplier(branchTech);
  }

  public static resolveAllUnitMultipliers(
    nation: Nation,
  ): NationCombatUnitMultipliers {
    return {
      infantry: this.getUnitMultiplier(nation, "INFANTRY"),
      armor: this.getUnitMultiplier(nation, "ARMOR"),
      airDefense: this.getUnitMultiplier(nation, "AIR_DEFENSE"),
      airForce: this.getUnitMultiplier(nation, "AIR_FORCE"),
      droneMissile: this.getUnitMultiplier(nation, "DRONE_MISSILE"),
    };
  }
}
