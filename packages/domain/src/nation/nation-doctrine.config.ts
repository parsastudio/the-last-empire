import {
  AiDoctrineType,
  AiDoctrineWeights,
  NationDoctrineProfile,
} from "./nation-doctrine.schema";

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

const COUNTRY_SPECIFIC_DOCTRINES: Record<string, AiDoctrineType> = {
  USA: "GLOBAL_HEGEMON",
  CHN: "GLOBAL_HEGEMON",

  RUS: "MILITARIST_HAWK",
  ISR: "MILITARIST_HAWK",
  PRK: "MILITARIST_HAWK",
  UKR: "MILITARIST_HAWK",
  TWN: "MILITARIST_HAWK",
  PAK: "MILITARIST_HAWK",
  IRN: "MILITARIST_HAWK",
  POL: "MILITARIST_HAWK",
  SYR: "MILITARIST_HAWK",
  AZE: "MILITARIST_HAWK",
  ARM: "MILITARIST_HAWK",
  BLR: "MILITARIST_HAWK",
  YEM: "MILITARIST_HAWK",
  AFG: "MILITARIST_HAWK",
  LBN: "MILITARIST_HAWK",
  IRQ: "MILITARIST_HAWK",
  LBY: "MILITARIST_HAWK",
  SOL: "MILITARIST_HAWK",
  SDS: "MILITARIST_HAWK",
  SRB: "MILITARIST_HAWK",

  DEU: "MERCANTILE_ECONOMIC",
  JPN: "MERCANTILE_ECONOMIC",
  KOR: "MERCANTILE_ECONOMIC",
  SAU: "MERCANTILE_ECONOMIC",
  ARE: "MERCANTILE_ECONOMIC",
  QAT: "MERCANTILE_ECONOMIC",
  KWT: "MERCANTILE_ECONOMIC",
  OMN: "MERCANTILE_ECONOMIC",
  CHE: "MERCANTILE_ECONOMIC",
  NLD: "MERCANTILE_ECONOMIC",
  NOR: "MERCANTILE_ECONOMIC",
  IRL: "MERCANTILE_ECONOMIC",
  SGP: "MERCANTILE_ECONOMIC",
  CYP: "MERCANTILE_ECONOMIC",
  NZL: "MERCANTILE_ECONOMIC",
  AUS: "MERCANTILE_ECONOMIC",
  CAN: "MERCANTILE_ECONOMIC",
  ISL: "MERCANTILE_ECONOMIC",
  GRL: "MERCANTILE_ECONOMIC",
  MYS: "MERCANTILE_ECONOMIC",

  FRA: "DOMESTIC_INDUSTRIALIST",
  GBR: "DOMESTIC_INDUSTRIALIST",
  IND: "DOMESTIC_INDUSTRIALIST",
  TUR: "DOMESTIC_INDUSTRIALIST",
  BRA: "DOMESTIC_INDUSTRIALIST",
  ITA: "DOMESTIC_INDUSTRIALIST",
  ESP: "DOMESTIC_INDUSTRIALIST",
  SWE: "DOMESTIC_INDUSTRIALIST",
  FIN: "DOMESTIC_INDUSTRIALIST",
  DNK: "DOMESTIC_INDUSTRIALIST",
  BEL: "DOMESTIC_INDUSTRIALIST",
  AUT: "DOMESTIC_INDUSTRIALIST",
  CZE: "DOMESTIC_INDUSTRIALIST",
  ROU: "DOMESTIC_INDUSTRIALIST",
  HUN: "DOMESTIC_INDUSTRIALIST",
  SVK: "DOMESTIC_INDUSTRIALIST",
  BGR: "DOMESTIC_INDUSTRIALIST",
  HRV: "DOMESTIC_INDUSTRIALIST",
  GRC: "DOMESTIC_INDUSTRIALIST",
  PRT: "DOMESTIC_INDUSTRIALIST",
  IDN: "DOMESTIC_INDUSTRIALIST",
  THA: "DOMESTIC_INDUSTRIALIST",
  VNM: "DOMESTIC_INDUSTRIALIST",
  PHL: "DOMESTIC_INDUSTRIALIST",
  BGD: "DOMESTIC_INDUSTRIALIST",
  MEX: "DOMESTIC_INDUSTRIALIST",
  ARG: "DOMESTIC_INDUSTRIALIST",
  CHL: "DOMESTIC_INDUSTRIALIST",
  COL: "DOMESTIC_INDUSTRIALIST",
  PER: "DOMESTIC_INDUSTRIALIST",
  ECU: "DOMESTIC_INDUSTRIALIST",
  VEN: "DOMESTIC_INDUSTRIALIST",
  CUB: "DOMESTIC_INDUSTRIALIST",
  GTM: "DOMESTIC_INDUSTRIALIST",
  BOL: "DOMESTIC_INDUSTRIALIST",
  DZA: "DOMESTIC_INDUSTRIALIST",
  MAR: "DOMESTIC_INDUSTRIALIST",
  EGY: "DOMESTIC_INDUSTRIALIST",
  NGA: "DOMESTIC_INDUSTRIALIST",
  ZAF: "DOMESTIC_INDUSTRIALIST",
  ETH: "DOMESTIC_INDUSTRIALIST",
  KEN: "DOMESTIC_INDUSTRIALIST",
  TZA: "DOMESTIC_INDUSTRIALIST",
  CMR: "DOMESTIC_INDUSTRIALIST",
  COD: "DOMESTIC_INDUSTRIALIST",
  BFA: "DOMESTIC_INDUSTRIALIST",
  MDG: "DOMESTIC_INDUSTRIALIST",
  KAZ: "DOMESTIC_INDUSTRIALIST",
  UZB: "DOMESTIC_INDUSTRIALIST",
  TKM: "DOMESTIC_INDUSTRIALIST",
  KGZ: "DOMESTIC_INDUSTRIALIST",
  TJK: "DOMESTIC_INDUSTRIALIST",
  MNG: "DOMESTIC_INDUSTRIALIST",
  LKA: "DOMESTIC_INDUSTRIALIST",
  JOR: "DOMESTIC_INDUSTRIALIST",
  DJI: "DOMESTIC_INDUSTRIALIST",
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
