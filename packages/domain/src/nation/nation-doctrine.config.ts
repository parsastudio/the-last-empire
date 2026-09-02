import {
  AiDoctrineType,
  AiDoctrineWeights,
  NationDoctrineProfile,
} from "@/domain/nation/nation-doctrine.schema";
import { COUNTRY_SPECIFIC_DOCTRINES } from "@/domain/nation/data/country-doctrine-map.data";

export const AI_DOCTRINE_PRESETS: Record<AiDoctrineType, AiDoctrineWeights> = {
  GLOBAL_HEGEMON: {
    innovationWeight: 0.35,
    globalMarketWeight: 0.2,
    domesticInfraWeight: 0.3,
    geopoliticsWeight: 0.15,
    researchDisparityThreshold: 1.2,
    peacetimeArmyCap: 0.85,
  },
  MILITARIST_HAWK: {
    innovationWeight: 0.2,
    globalMarketWeight: 0.45,
    domesticInfraWeight: 0.2,
    geopoliticsWeight: 0.15,
    researchDisparityThreshold: 2.5,
    peacetimeArmyCap: 0.95,
  },
  MERCANTILE_ECONOMIC: {
    innovationWeight: 0.15,
    globalMarketWeight: 0.45,
    domesticInfraWeight: 0.25,
    geopoliticsWeight: 0.15,
    researchDisparityThreshold: 0.8,
    peacetimeArmyCap: 0.5,
  },
  DOMESTIC_INDUSTRIALIST: {
    innovationWeight: 0.45,
    globalMarketWeight: 0.25,
    domesticInfraWeight: 0.25,
    geopoliticsWeight: 0.05,
    researchDisparityThreshold: 0.4,
    peacetimeArmyCap: 0.75,
  },
};

export class NationDoctrineResolver {
  public static resolveDoctrineType(
    countryCode: unknown,
    domesticTech = 1.0,
    equipmentTech = 1.0,
    gdp = 50_000_000_000,
  ): AiDoctrineType {
    const str =
      countryCode !== null && countryCode !== undefined
        ? String(countryCode)
        : "";
    const cleanCode = str.trim().toUpperCase();

    if (cleanCode && COUNTRY_SPECIFIC_DOCTRINES[cleanCode]) {
      return COUNTRY_SPECIFIC_DOCTRINES[cleanCode];
    }

    if (gdp >= 10_000_000_000_000 && domesticTech >= 5.0) {
      return "GLOBAL_HEGEMON";
    }

    if (gdp >= 400_000_000_000) {
      return "MERCANTILE_ECONOMIC";
    }

    if (domesticTech >= 3.0) {
      return "DOMESTIC_INDUSTRIALIST";
    }

    return "DOMESTIC_INDUSTRIALIST";
  }

  public static getDoctrineProfile(
    type: AiDoctrineType,
  ): NationDoctrineProfile {
    return {
      type,
      weights: { ...AI_DOCTRINE_PRESETS[type] },
    };
  }

  public static resolveProfileForCountry(
    countryCode: unknown,
    domesticTech = 1.0,
    equipmentTech = 1.0,
    gdp = 50_000_000_000,
  ): NationDoctrineProfile {
    const type = this.resolveDoctrineType(
      countryCode,
      domesticTech,
      equipmentTech,
      gdp,
    );
    return this.getDoctrineProfile(type);
  }
}
