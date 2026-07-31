import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { findCountryProfileById } from "@/infrastructure/data/countries";

export class GdpCalculator {
  private governmentSystem = new GovernmentSystem();

  public calculateBaseGdp(
    population: number,
    infrastructureLevel: number,
  ): number {
    const basePerCapita = 10;
    const infraBonus = 1 + infrastructureLevel * 0.05;
    return Math.floor(population * basePerCapita * infraBonus);
  }

  public calculateGdpGrowthMultiplier(nation: Nation): number {
    const currentStability = nation.government.stability;
    let stabilityFactor = -0.05 + (currentStability / 100) * 0.075;

    if (nation.traits.includes("FRAGILE_ECONOMY")) {
      stabilityFactor -= 0.05;
    }
    if (nation.geography.territorySize > 2000) {
      stabilityFactor += 0.015;
    }

    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    stabilityFactor += govTraits.economicGrowthBonus;

    for (const mod of nation.activeModifiers) {
      if (mod.effectType === "GDP_GROWTH_MULT") {
        stabilityFactor += mod.magnitude;
      }
    }

    if (nation.activeModifiers.some((m) => m.id === "martial-law-active")) {
      stabilityFactor -= 0.02;
    }

    return Math.max(0.85, 1.0 + stabilityFactor);
  }

  public updateNationGdp(nation: Nation): number {
    const growthMult = this.calculateGdpGrowthMultiplier(nation);
    const numericId = parseInt(nation.id.replace("NATION_", ""), 10);
    const profile = findCountryProfileById(numericId);

    const previousGdp =
      nation.gdp && nation.gdp > 0
        ? nation.gdp
        : profile
          ? profile.gdp
          : this.calculateBaseGdp(
              nation.population,
              nation.geography.infrastructureLevel,
            );

    return Math.floor(previousGdp * growthMult);
  }
}
