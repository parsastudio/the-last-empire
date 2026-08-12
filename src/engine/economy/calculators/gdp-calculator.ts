import { Nation, RegionDemographics } from "@/domain/nation/nation.schema";

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
    const population = newPopulation ?? nation.population;
    const productivity = Math.min(
      GdpCalculator.PRODUCTIVITY_CAP,
      newProductivity ?? nation.perCapitaProductivity ?? 5000,
    );

    let regionsDemographics: RegionDemographics[] | undefined =
      nation.regionsDemographics;
    if (regionsDemographics && regionsDemographics.length > 0) {
      const totalPixels = nation.geography.territoryPixelCount || 1;
      regionsDemographics = regionsDemographics.map((region) => {
        const ratio = region.pixelCount / totalPixels;
        return {
          ...region,
          population: Math.round(population * ratio),
        };
      });
    }

    return {
      ...nation,
      population,
      perCapitaProductivity: productivity,
      regionsDemographics,
    };
  }
}
