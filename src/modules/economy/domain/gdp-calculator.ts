import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { TraitManager } from "@/modules/nation/domain/trait-manager";
import { TariffCalculator } from "@/modules/trade/domain/tariff-calculator";
import { GovernmentSystem } from "@/modules/politics/domain/government-system";
import { ModifierManager } from "@/modules/events/domain/modifier-manager";

export class GdpCalculator {
  private traitManager = new TraitManager();
  private tariffCalculator = new TariffCalculator();
  private governmentSystem = new GovernmentSystem();
  private modifierManager = new ModifierManager();

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
    let growthRate = 0.0;
    if (nation.taxRate < 15) {
      growthRate += 0.003;
    } else if (nation.taxRate > 25) {
      growthRate -= (nation.taxRate - 25) * 0.0008;
    }
    if (nation.government.stability > 70) {
      growthRate += 0.002;
    } else if (nation.government.stability < 30) {
      growthRate -= 0.005;
    }
    const tradeBonus = peacefulNeighborsCount * 0.0015;
    growthRate += tradeBonus;
    const tariffResult = this.tariffCalculator.calculateTariffEffects(
      nation,
      100000,
    );
    growthRate -= tariffResult.gdpGrowthPenalty;
    growthRate += this.traitManager.getGdpGrowthModifier(nation) * 0.1;
    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    growthRate += govTraits.economicGrowthBonus * 0.1;

    growthRate += this.modifierManager.getModifierImpact(
      nation,
      "GDP_GROWTH_MULT",
    );

    const isMartialLawActive = nation.activeModifiers.some(
      (m) => m.id === "martial-law-active",
    );
    if (isMartialLawActive) {
      growthRate -= 0.02;
    }

    return Math.max(0.95, 1.0 + growthRate);
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
