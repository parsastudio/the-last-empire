export interface DemographicsCapacityMetrics {
  population: number;
  maxPopulationCapacity: number;
  capacityPercentage: number;
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
  ): DemographicsCapacityMetrics {
    const capacity = this.calculateCapacity(population, maxPopulationCapacity);
    const percentage = this.calculateCapacityPercentage(population, capacity);
    return {
      population,
      maxPopulationCapacity: capacity,
      capacityPercentage: percentage,
      isOverCapacity: percentage > 100,
      isNearCapacity: percentage >= 95,
    };
  }

  public static getProvinceMetrics(province: {
    population: number;
    maxPopulationCapacity?: number;
  }): DemographicsCapacityMetrics {
    return this.getMetrics(province.population, province.maxPopulationCapacity);
  }
}
