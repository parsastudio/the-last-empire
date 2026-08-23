import { Nation } from "@/domain/nation/nation.schema";

export class GdpCalculator {
  public static calculateProductivityOnUpgrade(
    currentProductivity: number,
  ): number {
    const prod = currentProductivity || 5000;
    return Math.max(100, Math.floor(prod * 1.05));
  }

  public static syncNationGdpAndDemographics(
    nation: Nation,
    newPopulation?: number,
    newProductivity?: number,
  ): Nation {
    const rawPopulation = newPopulation ?? nation.population;
    const capacity =
      nation.maxPopulationCapacity || Math.floor(rawPopulation / 0.95);
    const population = Math.min(capacity, rawPopulation);

    const productivity = Math.max(
      100,
      newProductivity ?? nation.perCapitaProductivity ?? 5000,
    );

    return {
      ...nation,
      population,
      perCapitaProductivity: productivity,
      maxPopulationCapacity: capacity,
    };
  }
}
