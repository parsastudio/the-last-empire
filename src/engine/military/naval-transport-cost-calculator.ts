export class NavalTransportCostCalculator {
  public calculateNavalTransportCost(
    totalTroops: number,
    distanceMultiplier: number,
    baseSeaRate = 15,
  ): number {
    const cost = totalTroops * baseSeaRate * distanceMultiplier;
    return Math.max(0, Math.floor(cost));
  }
}
