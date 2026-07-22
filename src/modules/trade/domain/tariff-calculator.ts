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
    if (tariffRate > 10) {
      gdpGrowthPenalty = (tariffRate - 10) * 0.0035;
    }

    return {
      tariffRevenue,
      gdpGrowthPenalty: Number(gdpGrowthPenalty.toFixed(4)),
    };
  }
}
