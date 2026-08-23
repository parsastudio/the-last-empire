import { Nation } from "@/domain/nation/nation.schema";

export class GdpCalculator {
  public static readonly PRODUCTIVITY_CAP = 300000;

  public static calculateProductivityOnUpgrade(
    currentProductivity: number,
  ): number {
    const prod = currentProductivity || 5000;
    const boosted = Math.floor(prod * 1.02);
    return Math.min(GdpCalculator.PRODUCTIVITY_CAP, Math.max(100, boosted));
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

    const productivity = Math.min(
      GdpCalculator.PRODUCTIVITY_CAP,
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
