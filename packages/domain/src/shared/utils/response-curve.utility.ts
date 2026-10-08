export class ResponseCurveUtility {
  public static sigmoid(
    x: number,
    midpoint: number,
    steepness: number,
  ): number {
    const exponent = -steepness * (x - midpoint);
    if (exponent > 40) return 0;
    if (exponent < -40) return 1;
    return 1 / (1 + Math.exp(exponent));
  }

  public static exponentialDecay(
    distance: number,
    decayRate: number,
  ): number {
    if (distance <= 0) return 1;
    return Math.exp(-decayRate * distance);
  }

  public static diminishingReturns(
    value: number,
    halfSaturation: number,
  ): number {
    if (value <= 0) return 0;
    if (halfSaturation <= 0) return 1;
    return value / (value + halfSaturation);
  }

  public static powerRatioAdvantage(ratio: number): number {
    if (ratio <= 0) return 1;
    return 1 / (1 + Math.pow(ratio, 1.8));
  }
}
