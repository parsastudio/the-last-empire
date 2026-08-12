import { Nation } from "@/domain/nation/nation.schema";
import { GdpCalculator } from "@/engine/economy/calculators/gdp-calculator";

export interface DemographicsResult {
  updatedNation: Nation;
  naturalChange: number;
  capacityRatio: number;
}

export class DemographicsEngine {
  public static processNaturalDemographics(nation: Nation): DemographicsResult {
    const rawPopulation = nation.population || 1000000;
    const capacity =
      nation.maxPopulationCapacity || Math.floor(rawPopulation / 0.95);
    const stability = nation.government.stability;

    const currentPopulation = Math.min(capacity, rawPopulation);

    let growthRate = 0;
    if (stability > 60) {
      growthRate = (stability - 60) * 0.0003;
    } else if (stability >= 40) {
      growthRate = 0.0001;
    } else {
      growthRate = (stability - 40) * 0.0004;
    }

    if (currentPopulation >= capacity && growthRate > 0) {
      growthRate = 0;
    }

    growthRate = Math.max(-0.05, Math.min(0.05, growthRate));

    const naturalChange = Math.floor(currentPopulation * growthRate);
    const newPopulation = Math.min(
      capacity,
      Math.max(100, currentPopulation + naturalChange),
    );

    const capacityRatio = capacity > 0 ? newPopulation / capacity : 1.0;

    const syncedNation = GdpCalculator.syncNationGdpAndDemographics(
      nation,
      newPopulation,
    );

    return {
      updatedNation: {
        ...syncedNation,
        maxPopulationCapacity: capacity,
      },
      naturalChange,
      capacityRatio,
    };
  }
}
