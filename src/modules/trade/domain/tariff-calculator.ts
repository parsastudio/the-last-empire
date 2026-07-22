import type { Nation } from "@/modules/nation/schemas/nation.schema";

export interface TariffEffectResult {
  tariffRevenue: number;
  gdpGrowthPenalty: number;
}

export class TariffCalculator {
  public calculateTariffEffects(
    nation: Nation,
    totalTradeValue: number,
  ): TariffEffectResult {
    const tariffRate = nation.tariffRate;
    const tariffRevenue = Math.floor(totalTradeValue * (tariffRate / 100));

    let gdpGrowthPenalty = 0;
    if (tariffRate > 15) {
      gdpGrowthPenalty = (tariffRate - 15) * 0.002;
    }

    return {
      tariffRevenue,
      gdpGrowthPenalty: Number(gdpGrowthPenalty.toFixed(4)),
    };
  }
}
