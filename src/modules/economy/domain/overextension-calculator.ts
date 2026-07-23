import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class OverextensionCalculator {
  public calculateOverextension(nation: Nation): number {
    const territory = nation.geography.territorySize;
    const population = nation.population;

    const territoryFactor =
      territory > 1500 ? 1.0 + Math.log10(territory / 1500) * 0.5 : 1.0;
    const populationFactor =
      population > 10000000
        ? 1.0 + Math.log10(population / 10000000) * 0.3
        : 1.0;

    const multiplier = territoryFactor * populationFactor;
    return Math.min(10.0, Number(multiplier.toFixed(2)));
  }
}
