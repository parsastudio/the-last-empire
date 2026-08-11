import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";

export interface GdpCalculationResult {
  nextProductivity: number;
  nextGdp: number;
}

export class GdpCalculator {
  public static readonly PRODUCTIVITY_CAP = 120000;

  public static calculateProductivityGrowth(nation: Nation): number {
    const currentProd = nation.perCapitaProductivity || 5000;
    const stability = nation.government.stability;
    const industrialLevel = nation.industrialLevel || 1;

    let baseGrowth = 0.005 + industrialLevel * 0.003;
    const stabilityFactor = -0.02 + (stability / 100) * 0.04;
    baseGrowth += stabilityFactor;

    const govTraits = GovernmentSystem.getTraits(nation.government.type);
    baseGrowth += govTraits.economicGrowthBonus;

    if (nation.doctrines?.unlockedDoctrines) {
      if (nation.doctrines.unlockedDoctrines.includes("gdp-booster")) {
        baseGrowth += 0.005;
      }
    }

    const saturationFactor = Math.max(
      0.05,
      1.0 - currentProd / GdpCalculator.PRODUCTIVITY_CAP,
    );

    const effectiveRate = baseGrowth * saturationFactor;
    return Math.max(-0.1, Math.min(0.15, effectiveRate));
  }

  public static updateProductivityAndGdp(nation: Nation): GdpCalculationResult {
    const currentProd = nation.perCapitaProductivity || 5000;
    const growthRate = GdpCalculator.calculateProductivityGrowth(nation);

    const nextProd = Math.min(
      GdpCalculator.PRODUCTIVITY_CAP,
      Math.max(100, Math.floor(currentProd * (1 + growthRate))),
    );

    const nextGdp = Math.floor(nation.population * nextProd);

    return {
      nextProductivity: nextProd,
      nextGdp,
    };
  }
}
