import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";

export class GdpCalculator {
  public static calculateBaseGdp(
    population: number,
    infrastructureLevel: number,
  ): number {
    const basePerCapita = 10;
    const infraBonus = 1 + infrastructureLevel * 0.05;
    return Math.floor(population * basePerCapita * infraBonus);
  }

  public static calculateGdpGrowthMultiplier(nation: Nation): number {
    const currentStability = nation.government.stability;
    let stabilityFactor = -0.05 + (currentStability / 100) * 0.075;

    if (nation.traits.includes("FRAGILE_ECONOMY")) {
      stabilityFactor -= 0.05;
    }
    if (nation.geography.territoryPixelCount > 2000) {
      stabilityFactor += 0.015;
    }

    const govTraits = GovernmentSystem.getTraits(nation.government.type);
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

  public static updateNationGdp(nation: Nation): number {
    const growthMult = GdpCalculator.calculateGdpGrowthMultiplier(nation);

    const previousGdp =
      nation.gdp && nation.gdp > 0
        ? nation.gdp
        : GdpCalculator.calculateBaseGdp(
            nation.population,
            nation.geography.infrastructureLevel,
          );

    return Math.floor(previousGdp * growthMult);
  }
}
