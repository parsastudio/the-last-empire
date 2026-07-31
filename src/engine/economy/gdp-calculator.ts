import { Nation } from "@/domain/nation/nation.schema";
import { BaseGdpCalculator } from "@/engine/economy/gdp/base-gdp.calculator";
import { GdpGrowthCalculator } from "@/engine/economy/gdp/gdp-growth.calculator";
import { findCountryProfileById } from "@/infrastructure/data/countries";

export class GdpCalculator {
  private baseGdpCalc = new BaseGdpCalculator();
  private growthCalc = new GdpGrowthCalculator();

  public calculateBaseGdp(
    population: number,
    infrastructureLevel: number,
  ): number {
    return this.baseGdpCalc.calculateBaseGdp(population, infrastructureLevel);
  }

  public calculateGdpGrowthMultiplier(nation: Nation): number {
    return this.growthCalc.calculateGdpGrowthMultiplier(nation);
  }

  public updateNationGdp(nation: Nation): number {
    const growthMult = this.growthCalc.calculateGdpGrowthMultiplier(nation);

    const numericId = parseInt(nation.id.replace("NATION_", ""), 10);
    const profile = findCountryProfileById(numericId);

    const previousGdp =
      nation.gdp && nation.gdp > 0
        ? nation.gdp
        : profile
          ? profile.gdp
          : this.baseGdpCalc.calculateBaseGdp(
              nation.population,
              nation.geography.infrastructureLevel,
            );

    return Math.floor(previousGdp * growthMult);
  }
}
