export interface DemographicsMetrics {
  population: number;
  maxPopulationCapacity: number;
  capacityPercentage: number;
  isOvercrowded: boolean;
  isOverCapacity: boolean;
  isNearCapacity: boolean;
}

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

  public static getMetrics(
    population: number,
    maxPopulationCapacity?: number,
  ): DemographicsMetrics {
    const maxCapacity = this.calculateCapacity(
      population,
      maxPopulationCapacity,
    );
    const capacityPercentage = this.calculateCapacityPercentage(
      population,
      maxPopulationCapacity,
    );
    const isOverCapacity =
      capacityPercentage >= 100 || population >= maxCapacity;
    const isNearCapacity = capacityPercentage >= 85;
    const isOvercrowded = capacityPercentage >= 95;

    return {
      population: Math.max(0, population),
      maxPopulationCapacity: maxCapacity,
      capacityPercentage,
      isOvercrowded,
      isOverCapacity,
      isNearCapacity,
    };
  }
}
