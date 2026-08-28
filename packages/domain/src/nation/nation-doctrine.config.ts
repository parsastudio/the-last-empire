import {
  AiDoctrineType,
  AiDoctrineWeights,
  NationDoctrineProfile,
} from "./nation-doctrine.schema";

export const AI_DOCTRINE_PRESETS: Record<AiDoctrineType, AiDoctrineWeights> = {
  ARMS_IMPORTER_RENTIER: {
    armsImportRatio: 0.85,
    researchFocusWeight: 0.2,
    developmentPriority: 0.65,
    peacetimeArmyCap: 0.6,
  },
  DOMESTIC_INDUSTRIALIST: {
    armsImportRatio: 0.15,
    researchFocusWeight: 0.8,
    developmentPriority: 0.55,
    peacetimeArmyCap: 0.7,
  },
  MERCANTILE_ECONOMIC: {
    armsImportRatio: 0.4,
    researchFocusWeight: 0.5,
    developmentPriority: 0.85,
    peacetimeArmyCap: 0.35,
  },
  MILITARIST_HAWK: {
    armsImportRatio: 0.35,
    researchFocusWeight: 0.75,
    developmentPriority: 0.25,
    peacetimeArmyCap: 0.95,
  },
  GLOBAL_HEGEMON: {
    armsImportRatio: 0.1,
    researchFocusWeight: 0.9,
    developmentPriority: 0.75,
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
    countryCode: string,
    domesticTech = 1.0,
    equipmentTech = 1.0,
    gdp = 50_000_000_000,
  ): AiDoctrineType {
    const cleanCode = countryCode.trim().toUpperCase();
    if (COUNTRY_SPECIFIC_DOCTRINES[cleanCode]) {
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
    countryCode: string,
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
