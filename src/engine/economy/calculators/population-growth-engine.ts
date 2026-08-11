import { Nation } from "@/domain/nation/nation.schema";

export class PopulationGrowthEngine {
  public updatePopulation(nation: Nation): number {
    const stability = Math.max(0, Math.min(100, nation.government.stability));
    const growthRate = stability / 5000 - 0.01;
    return Math.max(
      1,
      nation.population + Math.trunc(nation.population * growthRate),
    );
  }
}
