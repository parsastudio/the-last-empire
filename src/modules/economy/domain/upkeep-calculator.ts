import type { Nation } from "@/core/types/nation.types";

export interface BreakdownUpkeep {
  infantry: number;
  airForce: number;
  navy: number;
  droneMissile: number;
  infrastructure: number;
  total: number;
}

export class UpkeepCalculator {
  public calculateUpkeep(nation: Nation): BreakdownUpkeep {
    const inflationMultiplier = 1 + nation.inflation / 100;

    const infantry = Math.floor(
      nation.military.infantry *
        nation.upkeep.infantryUpkeep *
        inflationMultiplier,
    );
    const airForce = Math.floor(
      nation.military.airForce *
        nation.upkeep.airForceUpkeep *
        inflationMultiplier,
    );
    const navy = Math.floor(
      nation.military.navy * nation.upkeep.navyUpkeep * inflationMultiplier,
    );
    const droneMissile = Math.floor(
      nation.military.droneMissile *
        nation.upkeep.droneMissileUpkeep *
        inflationMultiplier,
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
