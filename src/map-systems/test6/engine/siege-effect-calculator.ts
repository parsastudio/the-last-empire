export class SiegeEffectCalculator {
  public calculatePulseScale(timestamp: number): number {
    const sinValue = Math.sin(timestamp * 0.003);
    const normalized = (sinValue + 1) * 0.5;
    return 0.95 + normalized * 0.1;
  }
}
