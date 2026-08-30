import { Province } from "@/domain/province/province.schema";

export class ProvinceDegradationUtility {
  public static readonly DEGRADATION_RATIO = 0.75;
  public static readonly MIN_POPULATION = 10;
  public static readonly MIN_PRODUCTIVITY = 100;
  public static readonly DEFAULT_PRODUCTIVITY = 5000;

  public static degradePopulation(population: number): number {
    return Math.max(
      this.MIN_POPULATION,
      Math.floor(population * this.DEGRADATION_RATIO),
    );
  }

  public static degradeProductivity(productivity?: number): number {
    const base = productivity ?? this.DEFAULT_PRODUCTIVITY;
    return Math.max(
      this.MIN_PRODUCTIVITY,
      Math.floor(base * this.DEGRADATION_RATIO),
    );
  }

  public static applyConquestDegradation(province: Province): {
    population: number;
    perCapitaProductivity: number;
  } {
    return {
      population: this.degradePopulation(province.population),
      perCapitaProductivity: this.degradeProductivity(
        province.perCapitaProductivity,
      ),
    };
  }

  public static degradeProvincesProductivity(
    provinces: Province[],
  ): Province[] {
    return provinces.map((p) => ({
      ...p,
      perCapitaProductivity: this.degradeProductivity(p.perCapitaProductivity),
    }));
  }
}
