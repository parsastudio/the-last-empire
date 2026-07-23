import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class IntelMasker {
  public maskNationData(
    nation: Nation,
    intelLevel: number,
    seed: number,
  ): Record<string, unknown> {
    if (intelLevel >= 3) {
      return {
        id: nation.id,
        name: nation.name,
        gdp: nation.gdp,
        population: nation.population,
        treasury: nation.treasury,
        debt: nation.nationalDebt,
        stability: nation.government.stability,
        military: {
          infantry: nation.military.infantry,
          airForce: nation.military.airForce,
          navy: nation.military.navy,
          droneMissile: nation.military.droneMissile,
        },
      };
    }

    const factor = this.getErrorFactor(intelLevel);
    const multiplier = 1.0 + (this.deterministicRandom(seed) * 2 - 1) * factor;

    if (intelLevel === 2) {
      return {
        id: nation.id,
        name: nation.name,
        gdp: Math.floor(nation.gdp * multiplier),
        population: Math.floor(nation.population * multiplier),
        treasury: Math.floor(nation.treasury * multiplier),
        debt: Math.floor(nation.nationalDebt * multiplier),
        stability: Math.max(
          0,
          Math.min(100, Math.floor(nation.government.stability * multiplier)),
        ),
        military: {
          infantry: Math.floor(nation.military.infantry * multiplier),
          airForce: "UNKNOWN",
          navy: "UNKNOWN",
          droneMissile: "UNKNOWN",
        },
      };
    }

    if (intelLevel === 1) {
      const wideMultiplier =
        1.0 + (this.deterministicRandom(seed) * 2 - 1) * 0.5;
      return {
        id: nation.id,
        name: nation.name,
        gdp: "UNKNOWN",
        population: "UNKNOWN",
        treasury: "UNKNOWN",
        debt: "UNKNOWN",
        stability: "UNKNOWN",
        military: {
          infantry: Math.max(
            0,
            Math.floor(nation.military.infantry * wideMultiplier),
          ),
          airForce: "UNKNOWN",
          navy: "UNKNOWN",
          droneMissile: "UNKNOWN",
        },
      };
    }

    return {
      id: nation.id,
      name: nation.name,
      gdp: "UNKNOWN",
      population: "UNKNOWN",
      treasury: "UNKNOWN",
      debt: "UNKNOWN",
      stability: "UNKNOWN",
      military: {
        infantry: "UNKNOWN",
        airForce: "UNKNOWN",
        navy: "UNKNOWN",
        droneMissile: "UNKNOWN",
      },
    };
  }

  private getErrorFactor(intelLevel: number): number {
    if (intelLevel === 2) {
      return 0.15;
    }
    return 0.5;
  }

  private deterministicRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}
