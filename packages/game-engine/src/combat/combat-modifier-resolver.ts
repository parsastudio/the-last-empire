import { Nation, UnitType } from "@geopolitics/domain";
import { MilitaryInventoryHelper } from "@geopolitics/domain";

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
    const techMult = 1 + (Math.max(1, branchTech) - 1) * 0.5;

    return techMult;
  }
}
