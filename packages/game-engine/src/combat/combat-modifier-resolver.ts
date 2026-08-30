import {
  Nation,
  UnitType,
  MilitaryInventoryHelper,
  MilitaryPowerCalculator,
} from "@geopolitics/domain";

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
}
