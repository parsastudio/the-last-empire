export class NoiseGrainApplier {
  private noiseLut = new Float32Array(256 * 256);

  constructor() {
    this.precomputeNoiseLut();
  }

  private precomputeNoiseLut(): void {
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        this.noiseLut[y * 256 + x] = (noise - 0.5) * 1.5;
      }
    }
  }

  public getNoiseGrain(x: number, y: number): number {
    const lx = x & 255;
    const ly = y & 255;
    return this.noiseLut[ly * 256 + lx] || 0;
  }
}
