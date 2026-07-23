import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class OverextensionCalculator {
  public calculateOverextension(nation: Nation): number {
    const territory = nation.geography.territorySize;
    const population = nation.population;

    const territoryFactor =
      territory > 1500 ? Math.pow(territory / 1500, 1.2) : 1.0;
    const populationFactor =
      population > 10000000 ? Math.pow(population / 10000000, 1.1) : 1.0;

    const multiplier = territoryFactor * populationFactor;
    return Math.min(10.0, Number(multiplier.toFixed(2)));
  }
}
