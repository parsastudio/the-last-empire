import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { TraitManager } from "@/modules/nation/domain/trait-manager";
import { GovernmentSystem } from "@/modules/politics/domain/government-system";

export interface BreakdownUpkeep {
  infantry: number;
  airForce: number;
  navy: number;
  droneMissile: number;
  infrastructure: number;
  total: number;
}

export class UpkeepCalculator {
  private traitManager = new TraitManager();
  private governmentSystem = new GovernmentSystem();

  public calculateUpkeep(nation: Nation): BreakdownUpkeep {
    const inflationMultiplier = 1 + nation.inflation / 100;
    const traitMultiplier = this.traitManager.getUpkeepMultiplier(nation);
    const govTraits = this.governmentSystem.getTraits(nation.government.type);

    const baseWeight =
      nation.military.infantry * 1.0 +
      nation.military.airForce * 3.0 +
      nation.military.navy * 2.0 +
      nation.military.droneMissile * 2.5;

    const totalMilitaryCost = Math.floor(
      baseWeight *
        12 *
        nation.military.techLevel *
        inflationMultiplier *
        traitMultiplier *
        govTraits.militaryUpkeepMultiplier,
    );

    const baseInfraUpkeep =
      nation.geography.infrastructureLevel *
      nation.upkeep.infrastructureUpkeep *
      1000 *
      inflationMultiplier;

    const infrastructure = Math.floor(
      baseInfraUpkeep * (1 + nation.geography.territorySize * 0.0001),
    );

    const total = totalMilitaryCost + infrastructure;

    return {
      infantry: Math.floor(totalMilitaryCost * 0.4),
      airForce: Math.floor(totalMilitaryCost * 0.3),
      navy: Math.floor(totalMilitaryCost * 0.2),
      droneMissile: Math.floor(totalMilitaryCost * 0.1),
      infrastructure,
      total,
    };
  }
}
