import type { Nation } from "@/domain/nation/nation.schema";

export class PopulationGrowthEngine {
  public calculatePopulationChange(nation: Nation): number {
    const stability = Math.max(0, Math.min(100, nation.government.stability));
    const growthRate = stability / 50 - 0.01;

    return Math.trunc(nation.population * growthRate);
  }

  public updatePopulation(nation: Nation): number {
    const change = this.calculatePopulationChange(nation);
    return Math.max(1, nation.population + change);
  }
}
