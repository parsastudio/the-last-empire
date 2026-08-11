import { Nation } from "@/domain/nation/nation.schema";

export interface DemographicsResult {
  updatedNation: Nation;
  naturalChange: number;
  capacityRatio: number;
}

export class DemographicsEngine {
  public static processNaturalDemographics(nation: Nation): DemographicsResult {
    const population = nation.population || 1000000;
    const capacity =
      nation.maxPopulationCapacity || Math.floor(population / 0.95);
    const stability = nation.government.stability;

    let growthRate = 0;
    if (stability > 60) {
      growthRate = (stability - 60) * 0.0003;
    } else if (stability >= 40) {
      growthRate = 0.0001;
    } else {
      growthRate = (stability - 40) * 0.0004;
    }

    const capacityRatio = population / (capacity || 1);
    if (capacityRatio > 1.0) {
      const overcrowdingPenalty = (capacityRatio - 1.0) * 0.02;
      growthRate -= overcrowdingPenalty;
    }

    growthRate = Math.max(-0.05, Math.min(0.05, growthRate));

    const naturalChange = Math.floor(population * growthRate);
    const newPopulation = Math.max(100, population + naturalChange);

    return {
      updatedNation: {
        ...nation,
        population: newPopulation,
        maxPopulationCapacity: capacity,
      },
      naturalChange,
      capacityRatio,
    };
  }
}
