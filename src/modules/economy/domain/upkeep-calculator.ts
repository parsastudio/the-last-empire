import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { TraitManager } from "@/modules/nation/domain/trait-manager";

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

  public calculateUpkeep(nation: Nation): BreakdownUpkeep {
    const inflationMultiplier = 1 + nation.inflation / 100;
    const traitMultiplier = this.traitManager.getUpkeepMultiplier(nation);

    const infantry = Math.floor(
      nation.military.infantry *
        nation.upkeep.infantryUpkeep *
        inflationMultiplier *
        traitMultiplier,
    );
    const airForce = Math.floor(
      nation.military.airForce *
        nation.upkeep.airForceUpkeep *
        inflationMultiplier *
        traitMultiplier,
    );
    const navy = Math.floor(
      nation.military.navy *
        nation.upkeep.navyUpkeep *
        inflationMultiplier *
        traitMultiplier,
    );
    const droneMissile = Math.floor(
      nation.military.droneMissile *
        nation.upkeep.droneMissileUpkeep *
        inflationMultiplier *
        traitMultiplier,
    );

    const infrastructure = Math.floor(
      nation.geography.infrastructureLevel *
        nation.upkeep.infrastructureUpkeep *
        1000 *
        inflationMultiplier,
    );

    const total = infantry + airForce + navy + droneMissile + infrastructure;

    return {
      infantry,
      airForce,
      navy,
      droneMissile,
      infrastructure,
      total,
    };
  }
}
