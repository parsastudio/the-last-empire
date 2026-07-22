import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class ManpowerManager {
  private readonly manpowerPopulationRatio = 0.15;

  public getMaxManpower(population: number): number {
    return Math.floor(population * this.manpowerPopulationRatio);
  }

  public calculateGrowth(nation: Nation): number {
    const maxManpower = this.getMaxManpower(nation.population);
    if (nation.resources.manpower >= maxManpower) {
      return 0;
    }

    const baseGrowth = Math.floor(nation.population * 0.002);
    const stabilityFactor = nation.government.stability / 100;
    return Math.floor(baseGrowth * stabilityFactor);
  }

  public deductManpower(nation: Nation, amount: number): Nation {
    return {
      ...nation,
      resources: {
        ...nation.resources,
        manpower: Math.max(0, nation.resources.manpower - amount),
      },
    };
  }

  public restoreManpower(nation: Nation, amount: number): Nation {
    const maxManpower = this.getMaxManpower(nation.population);
    const newManpower = Math.min(
      maxManpower,
      nation.resources.manpower + amount,
    );
    return {
      ...nation,
      resources: {
        ...nation.resources,
        manpower: newManpower,
      },
    };
  }
}
