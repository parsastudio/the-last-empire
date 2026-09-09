export class AiProcurementWeightsUtility {
  public static calculateDecayWeights(
    count: number,
    decayExponent = 1.4,
  ): number[] {
    if (count <= 0) return [];
    if (count === 1) return [1.0];

    const rawWeights = new Array<number>(count);
    let sum = 0;
    for (let i = 0; i < count; i++) {
      const w = Math.pow(11 - (i + 1), decayExponent);
      rawWeights[i] = w;
      sum += w;
    }

    return rawWeights.map((w) => w / (sum || 1));
  }
}
