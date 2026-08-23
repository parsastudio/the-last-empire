import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { NationGeographySyncer } from "@/engine/pipeline/nation-geography-syncer";

export interface DemographicsResult {
  updatedNation: Nation;
  updatedProvinces: Province[];
  naturalChange: number;
}

export class DemographicsEngine {
  public static processNaturalDemographics(
    nation: Nation,
    ownedProvinces: Province[],
  ): DemographicsResult {
    if (ownedProvinces.length === 0) {
      return {
        updatedNation: nation,
        updatedProvinces: [],
        naturalChange: 0,
      };
    }

    const stability = nation.government.stability;

    let growthRate = 0;
    if (stability > 60) {
      growthRate = ((stability - 60) / 40) * 0.02;
    } else if (stability >= 40) {
      growthRate = 0;
    } else {
      growthRate = ((stability - 40) / 40) * 0.05;
    }

    growthRate = Math.max(-0.05, Math.min(0.02, growthRate));

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

    const { syncedNation } = NationGeographySyncer.sync(
      nation,
      updatedProvinces,
    );

    return {
      updatedNation: syncedNation,
      updatedProvinces,
      naturalChange: totalNaturalChange,
    };
  }
}
