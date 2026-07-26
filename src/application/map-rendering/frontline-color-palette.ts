export class FrontlineColorPalette {
  public static readonly primaryRed = "rgb(239, 68, 68)";
  public static readonly glowRed = "rgba(239, 68, 68, 0.6)";
  private static readonly pulseMin = 0.4;
  private static readonly pulseMax = 0.8;

  public getPulseAlpha(timestamp: number): string {
    const sinValue = Math.sin(timestamp * 0.005);
    const normalized = (sinValue + 1) * 0.5;
    const alpha =
      FrontlineColorPalette.pulseMin +
      normalized *
        (FrontlineColorPalette.pulseMax - FrontlineColorPalette.pulseMin);
    return `rgba(239, 68, 68, ${alpha.toFixed(2)})`;
  }
}
