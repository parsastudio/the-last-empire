import { CountryProfile } from "@/domain/data/countries/profile.type";
import { GovernmentType } from "@/domain/politics/politics.schema";
import { AiDoctrineType } from "@/domain/nation/nation-doctrine.schema";
import { NationDoctrineResolver } from "@/domain/nation/nation-doctrine.config";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";

export interface NormalizedCountryFallback {
  nameFa: string;
  nameEn: string;
  code: string;
  flagCode: string;
  gdp: number;
  population: number;
  totalFactories: number;
  domesticTechLevel: number;
  equipmentTechLevel: number;
  startingTechLevel: number;
  industrialLevel: number;
  startingGovernment: GovernmentType;
  aiDoctrine: AiDoctrineType;
}

export class CountryDefaultsUtility {
  public static readonly DEFAULT_BASE_GDP = 50_000_000_000;
  public static readonly DEFAULT_BASE_POPULATION = 10_000_000;
  public static readonly DEFAULT_BASE_TECH_LEVEL = 1;
  public static readonly DEFAULT_GOVERNMENT: GovernmentType =
    "PLURALIST_PARLIAMENTARY";

  public static getFallbackProfile(
    identifier: unknown,
    profile?: CountryProfile,
  ): NormalizedCountryFallback {
    const str =
      identifier !== null && identifier !== undefined
        ? String(identifier)
        : "IRN";
    const cleanCode = str.trim().toUpperCase() || "IRN";

    const nameFa = profile?.nameFa ?? `کشور ${cleanCode}`;
    const nameEn = profile?.nameEn ?? cleanCode;
    const code = profile?.code ?? cleanCode;
    const flagCode =
      profile?.flagCode ?? (code.length >= 2 ? code.slice(0, 2) : "UN");

    const gdp = profile?.gdp ?? this.DEFAULT_BASE_GDP;
    const population = profile?.population ?? this.DEFAULT_BASE_POPULATION;

    const domesticTechLevel =
      profile?.domesticTechLevel ??
      profile?.startingTechLevel ??
      this.DEFAULT_BASE_TECH_LEVEL;
    const equipmentTechLevel = profile?.equipmentTechLevel ?? domesticTechLevel;
    const industrialLevel = domesticTechLevel;
    const startingTechLevel = domesticTechLevel;

    const totalFactories = IndustryCalculator.calculateStartingTotalFactories(
      gdp,
      industrialLevel,
    );

    const startingGovernment: GovernmentType =
      profile?.startingGovernment ?? this.DEFAULT_GOVERNMENT;

    const aiDoctrine =
      profile?.aiDoctrine ??
      NationDoctrineResolver.resolveDoctrineType(
        cleanCode,
        domesticTechLevel,
        equipmentTechLevel,
        gdp,
      );

    return {
      nameFa,
      nameEn,
      code,
      flagCode,
      gdp,
      population,
      totalFactories,
      domesticTechLevel,
      equipmentTechLevel,
      startingTechLevel,
      industrialLevel,
      startingGovernment,
      aiDoctrine,
    };
  }
}
