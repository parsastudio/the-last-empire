import type { Nation } from "@/domain/nation/nation.schema";

export interface TariffEffectResult {
  tariffRevenue: number;
  stabilityImpact: number;
  tradeVolumePercentage: number;
}

export class TariffCalculator {
  public calculateTariffEffects(nation: Nation): TariffEffectResult {
    const tariffRate = nation.tariffRate;
    const seaAccessFactor = nation.geography.hasSeaAccess ? 1.0 : 0.5;
    const baseTradeBase = nation.gdp * 0.05 * seaAccessFactor;

    const tradeVolumeFactor = Math.max(
      0.05,
      1.0 - Math.pow(tariffRate / 100, 1.1),
    );
    const tradeVolumePercentage = Math.round(tradeVolumeFactor * 100);

    const effectiveTradeValue = baseTradeBase * tradeVolumeFactor;
    const tariffRevenue = Math.floor(effectiveTradeValue * (tariffRate / 100));

    const stabilityImpact = Number(((10 - tariffRate) * 0.08).toFixed(2));

    return {
      tariffRevenue,
      stabilityImpact,
      tradeVolumePercentage,
    };
  }
}
