export class DemographicsCalculator {
  public static calculateCapacity(
    population: number,
    maxPopulationCapacity?: number,
  ): number {
    const safePop = Math.max(0, population);
    if (maxPopulationCapacity && maxPopulationCapacity > 0) {
      return maxPopulationCapacity;
    }
    return Math.floor(safePop / 0.95) || 100000000;
  }

  public static calculateCapacityPercentage(
    population: number,
    maxPopulationCapacity?: number,
  ): number {
    const capacity = this.calculateCapacity(population, maxPopulationCapacity);
    const safePop = Math.max(0, population);
    return Math.round((safePop / (capacity || 1)) * 100);
  }
}
