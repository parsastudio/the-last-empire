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
    const tradeVolumeFactor = Math.max(0.0, 1.0 - (tariffRate / 100) * 0.8);
    const effectiveTradeValue = totalTradeValue * tradeVolumeFactor;
    const tariffRevenue = Math.floor(effectiveTradeValue * (tariffRate / 100));

    let gdpGrowthPenalty = 0;
    if (tariffRate > 10) {
      gdpGrowthPenalty = (tariffRate - 10) * 0.001;
    }

    return {
      tariffRevenue,
      gdpGrowthPenalty: Number(gdpGrowthPenalty.toFixed(4)),
    };
  }
}
