import type { Nation } from "@/domain/nation/nation.schema";

export interface TariffEffectResult {
  tariffRevenue: number;
  gdpGrowthPenalty: number;
}

export class TariffCalculator {
  public calculateTariffEffects(nation: Nation): TariffEffectResult {
    const tariffRate = nation.tariffRate;
    const seaAccessFactor = nation.geography.hasSeaAccess ? 1.0 : 0.5;
    const baseTradeBase = nation.gdp * 0.05 * seaAccessFactor;
    const tradeVolumeFactor = Math.max(0.0, 1.0 - (tariffRate / 100) * 0.8);
    const effectiveTradeValue = baseTradeBase * tradeVolumeFactor;
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
