export class ConquestCapper {
  private readonly sqKmPerPixel = 86.3;
  private readonly minConquestAreaSqKm = 50000;

  public calculateCappedTarget(targetTheaterPixels: number): number {
    const minPixelsNeeded = Math.ceil(
      this.minConquestAreaSqKm / this.sqKmPerPixel,
    );

    if (targetTheaterPixels <= minPixelsNeeded) {
      return targetTheaterPixels;
    }

    const quarterPixels = Math.floor(targetTheaterPixels * 0.25);
    const calculatedTarget = Math.max(quarterPixels, minPixelsNeeded);
    return Math.min(calculatedTarget, targetTheaterPixels);
  }
}
