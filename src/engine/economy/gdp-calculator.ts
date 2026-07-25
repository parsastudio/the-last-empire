import { Nation } from "@/domain/nation/nation.schema";
import { BaseGdpCalculator } from "./gdp/base-gdp.calculator";
import { GdpGrowthCalculator } from "./gdp/gdp-growth.calculator";

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
    peacefulNeighborsCount: number,
  ): number {
    return this.growthCalc.calculateGdpGrowthMultiplier(
      nation,
      peacefulNeighborsCount,
    );
  }

  public updateNationGdp(
    nation: Nation,
    peacefulNeighborsCount: number,
  ): number {
    const growthMult = this.growthCalc.calculateGdpGrowthMultiplier(
      nation,
      peacefulNeighborsCount,
    );
    const previousGdp =
      nation.gdp ||
      this.baseGdpCalc.calculateBaseGdp(
        nation.population,
        nation.geography.infrastructureLevel,
      );
    return Math.floor(previousGdp * growthMult);
  }
}
