import { Nation, UnitType } from "@geopolitics/domain";
import { MilitaryInventoryHelper } from "@geopolitics/domain";
import { GovernmentSystem } from "@/engine/politics/government-system";

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
    const govTraits = GovernmentSystem.getTraits(nation.government.type);

    return techMult * govTraits.militaryPowerMultiplier;
  }

  public static getEffectiveMultiplier(nation: Nation): number {
    const techLevel = Math.max(1, nation.military.techLevel || 1);
    const techMult = 1 + (techLevel - 1) * 0.5;
    const govTraits = GovernmentSystem.getTraits(nation.government.type);

    return techMult * govTraits.militaryPowerMultiplier;
  }
}
