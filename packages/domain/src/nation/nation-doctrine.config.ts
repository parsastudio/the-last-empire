import {
  AiDoctrineType,
  AiDoctrineWeights,
  NationDoctrineProfile,
} from "./nation-doctrine.schema";

export const AI_DOCTRINE_PRESETS: Record<AiDoctrineType, AiDoctrineWeights> = {
  ARMS_IMPORTER_RENTIER: {
    innovationWeight: 0.15,
    globalMarketWeight: 0.45,
    domesticInfraWeight: 0.25,
    geopoliticsWeight: 0.15,
    peacetimeArmyCap: 0.65,
  },
  DOMESTIC_INDUSTRIALIST: {
    innovationWeight: 0.45,
    globalMarketWeight: 0.25,
    domesticInfraWeight: 0.25,
    geopoliticsWeight: 0.05,
    peacetimeArmyCap: 0.75,
  },
  MERCANTILE_ECONOMIC: {
    innovationWeight: 0.15,
    globalMarketWeight: 0.4,
    domesticInfraWeight: 0.25,
    geopoliticsWeight: 0.2,
    peacetimeArmyCap: 0.5,
  },
  MILITARIST_HAWK: {
    innovationWeight: 0.2,
    globalMarketWeight: 0.45,
    domesticInfraWeight: 0.2,
    geopoliticsWeight: 0.15,
    peacetimeArmyCap: 0.95,
  },
  GLOBAL_HEGEMON: {
    innovationWeight: 0.35,
    globalMarketWeight: 0.2,
    domesticInfraWeight: 0.3,
    geopoliticsWeight: 0.15,
    peacetimeArmyCap: 0.85,
  },
};

const COUNTRY_SPECIFIC_DOCTRINES: Record<string, AiDoctrineType> = {
  USA: "GLOBAL_HEGEMON",
  CHN: "GLOBAL_HEGEMON",

  SAU: "ARMS_IMPORTER_RENTIER",
  ARE: "ARMS_IMPORTER_RENTIER",
  QAT: "ARMS_IMPORTER_RENTIER",
  KWT: "ARMS_IMPORTER_RENTIER",
  OMN: "ARMS_IMPORTER_RENTIER",
  IRQ: "ARMS_IMPORTER_RENTIER",

  IRN: "DOMESTIC_INDUSTRIALIST",
  TUR: "DOMESTIC_INDUSTRIALIST",
  RUS: "DOMESTIC_INDUSTRIALIST",
  FRA: "DOMESTIC_INDUSTRIALIST",
  GBR: "DOMESTIC_INDUSTRIALIST",
  IND: "DOMESTIC_INDUSTRIALIST",
  SWE: "DOMESTIC_INDUSTRIALIST",
  BRA: "DOMESTIC_INDUSTRIALIST",

  DEU: "MERCANTILE_ECONOMIC",
  JPN: "MERCANTILE_ECONOMIC",
  CHE: "MERCANTILE_ECONOMIC",
  NLD: "MERCANTILE_ECONOMIC",
  NOR: "MERCANTILE_ECONOMIC",
  CAN: "MERCANTILE_ECONOMIC",
  AUS: "MERCANTILE_ECONOMIC",
  ITA: "MERCANTILE_ECONOMIC",
  ESP: "MERCANTILE_ECONOMIC",

  PRK: "MILITARIST_HAWK",
  ISR: "MILITARIST_HAWK",
  PAK: "MILITARIST_HAWK",
  TWN: "MILITARIST_HAWK",
  UKR: "MILITARIST_HAWK",
  SYR: "MILITARIST_HAWK",
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

    const techGap = equipmentTech - domesticTech;
    if (techGap >= 1.0) {
      return "ARMS_IMPORTER_RENTIER";
    }

    if (domesticTech >= 3.5) {
      return "DOMESTIC_INDUSTRIALIST";
    }

    if (gdp >= 500_000_000_000) {
      return "MERCANTILE_ECONOMIC";
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
