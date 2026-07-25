export class ConquestCapper {
  public calculateCappedTarget(
    globalDefenderPixels: number,
    targetTheaterPixels: number,
  ): number {
    const targetLimit = Math.floor(globalDefenderPixels * 0.25);
    return Math.min(targetLimit, targetTheaterPixels);
  }
}
