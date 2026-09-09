import {
  Nation,
  UnitType,
  MilitaryInventoryHelper,
  MilitaryPowerCalculator,
  NationalProjectEffectApplierUtility,
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
    const projectPowerMultiplier =
      NationalProjectEffectApplierUtility.getCombinedMultiplier(
        nation.completedProjectIds,
        "militaryPowerBonusMultiplier",
      );

    return {
      infantry:
        this.getUnitMultiplier(nation, "INFANTRY") * projectPowerMultiplier,
      armor: this.getUnitMultiplier(nation, "ARMOR") * projectPowerMultiplier,
      airDefense:
        this.getUnitMultiplier(nation, "AIR_DEFENSE") * projectPowerMultiplier,
      airForce:
        this.getUnitMultiplier(nation, "AIR_FORCE") * projectPowerMultiplier,
      droneMissile:
        this.getUnitMultiplier(nation, "DRONE_MISSILE") *
        projectPowerMultiplier,
    };
  }
}
