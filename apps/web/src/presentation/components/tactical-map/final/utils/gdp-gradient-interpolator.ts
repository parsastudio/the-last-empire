export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export class GdpGradientInterpolator {
  private static interpolateChannel(
    a: number,
    b: number,
    factor: number,
  ): number {
    return Math.round(a + (b - a) * factor);
  }

  public static calculateColor(normalized: number): RgbColor {
    const t = Math.max(0, Math.min(1.0, normalized));

    if (t <= 0.33) {
      const segT = t / 0.33;
      return {
        r: this.interpolateChannel(225, 249, segT),
        g: this.interpolateChannel(29, 115, segT),
        b: this.interpolateChannel(72, 22, segT),
      };
    }

    if (t <= 0.66) {
      const segT = (t - 0.33) / 0.33;
      return {
        r: this.interpolateChannel(249, 163, segT),
        g: this.interpolateChannel(115, 230, segT),
        b: this.interpolateChannel(22, 53, segT),
      };
    }

    const segT = (t - 0.66) / 0.34;
    return {
      r: this.interpolateChannel(163, 16, segT),
      g: this.interpolateChannel(230, 185, segT),
      b: this.interpolateChannel(53, 129, segT),
    };
  }
}
