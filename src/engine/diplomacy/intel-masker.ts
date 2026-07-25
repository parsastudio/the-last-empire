import type { Nation } from "@/domain/nation/nation.schema";
import { IntelLevelEvaluator } from "@/engine/diplomacy/intel-level-evaluator";

export class IntelMasker {
  private evaluator = new IntelLevelEvaluator();

  public maskNationData(
    nation: Nation,
    intelLevel: number,
    seed: number,
  ): Record<string, unknown> {
    if (intelLevel >= 2) {
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
          droneMissile: nation.military.droneMissile,
        },
      };
    }

    const factor = this.getErrorFactor(intelLevel);
    const multiplier =
      1.0 + (this.deterministicRandom(seed, nation.id) * 2 - 1) * factor;

    if (intelLevel === 1) {
      return {
        id: nation.id,
        name: nation.name,
        gdp: Math.floor(nation.gdp * multiplier),
        population: Math.floor(nation.population * multiplier),
        treasury: "UNKNOWN",
        debt: "UNKNOWN",
        stability: Math.max(
          0,
          Math.min(100, Math.floor(nation.government.stability * multiplier)),
        ),
        military: {
          infantry: this.evaluator.getInfantryLabel(nation.military.infantry),
          airForce: "UNKNOWN",
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
        droneMissile: "UNKNOWN",
      },
    };
  }

  private getErrorFactor(intelLevel: number): number {
    if (intelLevel === 1) {
      return 0.15;
    }
    return 0.5;
  }

  private deterministicRandom(seed: number, nationId: string): number {
    let hash = seed;
    for (let i = 0; i < nationId.length; i++) {
      hash = (hash << 5) - hash + nationId.charCodeAt(i);
      hash |= 0;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  }
}
