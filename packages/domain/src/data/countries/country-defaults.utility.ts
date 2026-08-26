import { CountryProfile } from "@/domain/data/countries/profile.type";
import { GovernmentType } from "@/domain/politics/politics.schema";

export interface NormalizedCountryFallback {
  nameFa: string;
  nameEn: string;
  code: string;
  flagCode: string;
  gdp: number;
  population: number;
  perCapitaProductivity: number;
  maxPopulationCapacity: number;
  militaryTier: number;
  startingTechLevel: number;
  startingGovernment: GovernmentType;
}

export class CountryDefaultsUtility {
  public static readonly DEFAULT_BASE_GDP = 50_000_000_000;
  public static readonly DEFAULT_BASE_POPULATION = 10_000_000;
  public static readonly DEFAULT_BASE_PRODUCTIVITY = 5_000;
  public static readonly DEFAULT_BASE_TECH_LEVEL = 1;
  public static readonly DEFAULT_BASE_MILITARY_TIER = 5;
  public static readonly DEFAULT_GOVERNMENT: GovernmentType = "DEMOCRACY";

  public static calculateProductivity(gdp: number, population: number): number {
    if (population <= 0) return this.DEFAULT_BASE_PRODUCTIVITY;
    return Math.max(100, Math.floor(gdp / population));
  }

  public static calculateCapacity(population: number): number {
    const safePop = Math.max(100, population);
    return Math.floor(safePop / 0.95);
  }

  public static getFallbackProfile(
    identifier: string,
    profile?: CountryProfile,
  ): NormalizedCountryFallback {
    const cleanCode = identifier.trim().toUpperCase();

    const nameFa = profile?.nameFa ?? `کشور ${cleanCode}`;
    const nameEn = profile?.nameEn ?? cleanCode;
    const code = profile?.code ?? cleanCode;
    const flagCode =
      profile?.flagCode ?? (code.length >= 2 ? code.slice(0, 2) : "UN");

    const gdp = profile?.gdp ?? this.DEFAULT_BASE_GDP;
    const population = profile?.population ?? this.DEFAULT_BASE_POPULATION;
    const perCapitaProductivity = this.calculateProductivity(gdp, population);
    const maxPopulationCapacity = this.calculateCapacity(population);

    const militaryTier =
      profile?.militaryTier ?? this.DEFAULT_BASE_MILITARY_TIER;
    const startingTechLevel =
      profile?.startingTechLevel ?? this.DEFAULT_BASE_TECH_LEVEL;
    const startingGovernment: GovernmentType =
      profile?.startingGovernment ?? this.DEFAULT_GOVERNMENT;

    return {
      nameFa,
      nameEn,
      code,
      flagCode,
      gdp,
      population,
      perCapitaProductivity,
      maxPopulationCapacity,
      militaryTier,
      startingTechLevel,
      startingGovernment,
    };
  }
}
