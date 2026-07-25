export class IslandFilter {
  private readonly thresholdAreaSqKm = 50000;

  public shouldPurgeIsland(totalAreaSqKm: number): boolean {
    return totalAreaSqKm < this.thresholdAreaSqKm;
  }
}
