export class ShorelineShadowCalculator {
  private readonly shoreR = 198;
  private readonly shoreG = 216;
  private readonly shoreB = 214;

  private readonly midR = 175;
  private readonly midG = 196;
  private readonly midB = 202;

  private readonly deepR = 142;
  private readonly deepG = 166;
  private readonly deepB = 180;

  private lut: { r: number; g: number; b: number }[] = [];

  constructor() {
    this.precomputeLut();
  }

  private precomputeLut(): void {
    this.lut = new Array(256);
    for (let d = 0; d < 256; d++) {
      const t = 1.0 - Math.exp(-d * 0.12);
      let r = 255;
      let g = 255;
      let b = 255;

      if (t < 0.5) {
        const ratio = t / 0.5;
        r = Math.floor(this.shoreR * (1.0 - ratio) + this.midR * ratio);
        g = Math.floor(this.shoreG * (1.0 - ratio) + this.midG * ratio);
        b = Math.floor(this.shoreB * (1.0 - ratio) + this.midB * ratio);
      } else {
        const ratio = (t - 0.5) / 0.5;
        r = Math.floor(this.midR * (1.0 - ratio) + this.deepR * ratio);
        g = Math.floor(this.shoreG * (1.0 - ratio) + this.deepG * ratio);
        b = Math.floor(this.shoreB * (1.0 - ratio) + this.deepB * ratio);
      }

      if (d >= 1 && d <= 12) {
        const shadow = 0.82 + 0.18 * ((d - 1) / 11);
        r = Math.floor(r * shadow);
        g = Math.floor(g * shadow);
        b = Math.floor(b * shadow);
      }

      this.lut[d] = { r, g, b };
    }
  }

  public calculateOceanColor(d: number): { r: number; g: number; b: number } {
    const clampedDist = Math.max(0, Math.min(255, d));
    return this.lut[clampedDist] || { r: 142, g: 166, b: 180 };
  }
}
