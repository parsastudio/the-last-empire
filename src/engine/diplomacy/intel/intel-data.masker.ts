import { Nation } from "@/domain/nation/nation.schema";
import { IntelLevelEvaluator } from "@/engine/diplomacy/intel-level-evaluator";
import { DeterministicNoiseGenerator } from "./deterministic-noise.generator";

export class IntelDataMasker {
  private evaluator = new IntelLevelEvaluator();
  private noiseGenerator = new DeterministicNoiseGenerator();

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

    const factor = intelLevel === 1 ? 0.15 : 0.5;
    const multiplier =
      1.0 +
      (this.noiseGenerator.deterministicRandom(seed, nation.id) * 2 - 1) *
        factor;

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
}
