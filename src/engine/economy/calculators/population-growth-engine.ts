import { Nation } from "@/domain/nation/nation.schema";
import { DemographicsEngine } from "@/engine/economy/demographics/demographics-engine";

export class PopulationGrowthEngine {
  public updatePopulation(nation: Nation): number {
    const result = DemographicsEngine.processNaturalDemographics(nation);
    return result.updatedNation.population;
  }
}
