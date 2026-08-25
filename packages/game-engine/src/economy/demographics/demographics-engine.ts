import { Province } from "@/domain/province/province.schema";

export interface DemographicsResult {
  updatedProvinces: Province[];
  naturalChange: number;
}

export class DemographicsEngine {
  public static processNaturalDemographics(
    stability: number,
    ownedProvinces: Province[],
  ): DemographicsResult {
    if (ownedProvinces.length === 0) {
      return {
        updatedProvinces: [],
        naturalChange: 0,
      };
    }

    let growthRate = 0;
    if (stability > 60) {
      growthRate = ((stability - 60) / 40) * 0.04;
    } else if (stability >= 40) {
      growthRate = 0;
    } else {
      growthRate = ((stability - 40) / 40) * 0.06;
    }

    growthRate = Math.max(-0.06, Math.min(0.04, growthRate));

    if (growthRate === 0) {
      return {
        updatedProvinces: ownedProvinces,
        naturalChange: 0,
      };
    }

    let totalNaturalChange = 0;
    const updatedProvinces: Province[] = [];

    for (let i = 0; i < ownedProvinces.length; i++) {
      const prov = ownedProvinces[i]!;
      const currentPop = prov.population;
      const capacity = prov.maxPopulationCapacity;

      let change = 0;
      if (growthRate > 0) {
        const availableHeadroom = Math.max(0, capacity - currentPop);
        const desiredGrowth = Math.floor(currentPop * growthRate);
        change = Math.min(availableHeadroom, desiredGrowth);
      } else if (growthRate < 0) {
        change = Math.floor(currentPop * growthRate);
      }

      const nextPop = Math.max(10, currentPop + change);
      totalNaturalChange += nextPop - currentPop;

      updatedProvinces.push({
        ...prov,
        population: nextPop,
      });
    }

    return {
      updatedProvinces,
      naturalChange: totalNaturalChange,
    };
  }
}
