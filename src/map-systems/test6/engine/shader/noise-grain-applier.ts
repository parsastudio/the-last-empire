export class NoiseGrainApplier {
  public getNoiseGrain(x: number, y: number): number {
    const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
    return (noise - 0.5) * 1.5;
  }
}
