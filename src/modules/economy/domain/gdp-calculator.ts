import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { TraitManager } from "@/modules/nation/domain/trait-manager";
import { TariffCalculator } from "@/modules/trade/domain/tariff-calculator";
import { GovernmentSystem } from "@/modules/politics/domain/government-system";

export class GdpCalculator {
  private traitManager = new TraitManager();
  private tariffCalculator = new TariffCalculator();
  private governmentSystem = new GovernmentSystem();

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
    const tariffResult = this.tariffCalculator.calculateTariffEffects(
      nation,
      100000,
    );
    multiplier -= tariffResult.gdpGrowthPenalty;
    multiplier += this.traitManager.getGdpGrowthModifier(nation);
    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    multiplier += govTraits.economicGrowthBonus;
    return Math.max(0.5, multiplier);
  }

  public updateNationGdp(
    nation: Nation,
    peacefulNeighborsCount: number,
  ): number {
    const growthMult = this.calculateGdpGrowthMultiplier(
      nation,
      peacefulNeighborsCount,
    );
    const previousGdp =
      nation.gdp ||
      this.calculateBaseGdp(
        nation.population,
        nation.geography.infrastructureLevel,
      );
    return Math.floor(previousGdp * growthMult);
  }
}
