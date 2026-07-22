import type { Nation } from "@/core/types/nation.types";

export interface TariffEffectResult {
  tariffRevenue: number;
  gdpGrowthPenalty: number;
}

export class TariffCalculator {
  public calculateTariffEffects(
    nation: Nation,
    totalTradeValue: number,
    tariffRate: number,
  ): TariffEffectResult {
    const clampedRate = Math.max(0, Math.min(100, tariffRate));

    const tariffRevenue = Math.floor(totalTradeValue * (clampedRate / 100));

    let gdpGrowthPenalty = 0;
    if (clampedRate > 15) {
      gdpGrowthPenalty = (clampedRate - 15) * 0.002;
    }

    return {
      tariffRevenue,
      gdpGrowthPenalty: Number(gdpGrowthPenalty.toFixed(4)),
    };
  }
}
