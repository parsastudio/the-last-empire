import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { TraitManager } from "@/modules/nation/domain/trait-manager";
import { GovernmentSystem } from "@/modules/politics/domain/government-system";

export interface BreakdownUpkeep {
  infantry: number;
  airForce: number;
  droneMissile: number;
  infrastructure: number;
  total: number;
}

export class UpkeepCalculator {
  private traitManager = new TraitManager();
  private governmentSystem = new GovernmentSystem();

  public calculateUpkeep(nation: Nation): BreakdownUpkeep {
    const traitMultiplier = this.traitManager.getUpkeepMultiplier(nation);
    const govTraits = this.governmentSystem.getTraits(nation.government.type);

    const baseWeight =
      nation.military.infantry * 1.0 +
      nation.military.airForce * 3.0 +
      nation.military.droneMissile * 2.5;

    const totalMilitaryCost = Math.floor(
      baseWeight *
        12 *
        nation.military.techLevel *
        traitMultiplier *
        govTraits.militaryUpkeepMultiplier,
    );

    const baseInfraUpkeep =
      nation.geography.infrastructureLevel *
      nation.upkeep.infrastructureUpkeep *
      1000;

    const infrastructure = Math.floor(
      baseInfraUpkeep *
        (1 + Math.pow(nation.geography.territorySize, 1.1) * 0.001) *
        nation.adminBurdenMultiplier,
    );

    let adminPenalty = 0;
    if (nation.taxRate < 5) {
      adminPenalty = Math.floor(nation.gdp * 0.01 * (5 - nation.taxRate));
    }

    const total = totalMilitaryCost + infrastructure + adminPenalty;

    return {
      infantry: Math.floor(totalMilitaryCost * 0.5),
      airForce: Math.floor(totalMilitaryCost * 0.35),
      droneMissile: Math.floor(totalMilitaryCost * 0.15),
      infrastructure,
      total,
    };
  }
}
