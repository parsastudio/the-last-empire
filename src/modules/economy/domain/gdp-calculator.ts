import type { Nation } from "@/core/types/nation.types";

export class GdpCalculator {
  public calculateBaseGdp(
    population: number,
    infrastructureLevel: number,
  ): number {
    const basePerCapita = 10;
    const infraBonus = 1 + infrastructureLevel * 0.15;
    return Math.floor(population * basePerCapita * infraBonus);
  }

  public calculateGdpGrowthMultiplier(
    nation: Nation,
    peacefulNeighborsCount: number,
  ): number {
    let multiplier = 1.0;

    if (nation.taxRate < 15) {
      multiplier += 0.03;
    } else if (nation.taxRate > 25) {
      multiplier -= 0.04;
    }

    if (nation.government.stability > 70) {
      multiplier += 0.02;
    } else if (nation.government.stability < 30) {
      multiplier -= 0.05;
    }

    const tradeBonus = peacefulNeighborsCount * 0.015;
    multiplier += tradeBonus;

    if (nation.tariffRate > 15) {
      multiplier -= (nation.tariffRate - 15) * 0.002;
    }

    return Math.max(0.5, multiplier);
  }

  public updateNationGdp(
    nation: Nation,
    peacefulNeighborsCount: number,
  ): number {
    const baseGdp = this.calculateBaseGdp(
      nation.population,
      nation.geography.infrastructureLevel,
    );
    const growthMult = this.calculateGdpGrowthMultiplier(
      nation,
      peacefulNeighborsCount,
    );
    return Math.floor(baseGdp * growthMult);
  }
}
