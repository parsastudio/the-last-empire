import { Nation } from "@/domain/nation/nation.schema";
import { BaseGdpCalculator } from "./gdp/base-gdp.calculator";
import { GdpGrowthCalculator } from "./gdp/gdp-growth.calculator";
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

  public calculateGdpGrowthMultiplier(
    nation: Nation,
    peacefulNeighborsCount = 0,
  ): number {
    return this.growthCalc.calculateGdpGrowthMultiplier(
      nation,
      peacefulNeighborsCount,
    );
  }

  public updateNationGdp(nation: Nation, peacefulNeighborsCount = 0): number {
    const growthMult = this.growthCalc.calculateGdpGrowthMultiplier(
      nation,
      peacefulNeighborsCount,
    );

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
