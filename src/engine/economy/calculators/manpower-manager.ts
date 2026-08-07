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

export class ManpowerManager {
  public getMaxManpower(population: number): number {
    return Math.floor(population * 0.15);
  }

  public calculateGrowth(nation: Nation): number {
    if (nation.resources.manpower >= this.getMaxManpower(nation.population))
      return 0;
    return Math.floor(
      Math.floor(nation.population * 0.002) *
        (nation.government.stability / 100),
    );
  }

  public restoreManpower(nation: Nation, amount: number): Nation {
    const newManpower = Math.min(
      this.getMaxManpower(nation.population),
      nation.resources.manpower + amount,
    );
    return {
      ...nation,
      resources: { ...nation.resources, manpower: newManpower },
    };
  }
}
