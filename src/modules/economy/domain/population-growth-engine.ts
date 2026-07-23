import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class PopulationGrowthEngine {
  public calculatePopulationChange(nation: Nation, isAtWar: boolean): number {
    let growthRate = 0.012;

    if (nation.government.stability > 70) {
      growthRate += 0.005;
    } else if (nation.government.stability < 30) {
      growthRate -= 0.01;
    }

    if (isAtWar) {
      growthRate -= 0.015;
    }

    const size = nation.geography.territorySize || 100;
    const density = nation.population / size;
    if (density > 1500) {
      growthRate -= 0.006;
    }

    return Math.floor(nation.population * growthRate);
  }

  public updatePopulation(nation: Nation, isAtWar: boolean): number {
    const change = this.calculatePopulationChange(nation, isAtWar);
    return Math.max(1, nation.population + change);
  }
}
