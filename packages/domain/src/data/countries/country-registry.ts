import { CountryProfile } from "@/domain/data/countries/profile.type";
import { COUNTRY_IDENTITY_MAP } from "@/domain/data/countries/sources/country-identity.data";
import { COUNTRY_DEMOGRAPHICS_MAP } from "@/domain/data/countries/sources/country-demographics.data";
import { COUNTRY_GDP_MAP } from "@/domain/data/countries/sources/country-economy.data";
import { COUNTRY_MILITARY_MAP } from "@/domain/data/countries/sources/country-military.data";
import {
  FinalMapManifest,
  FinalManifestNation,
} from "@/domain/map/manifest.type";
import { NationDoctrineResolver } from "@/domain/nation/nation-doctrine.config";
import { AiDoctrineType } from "@/domain/nation/nation-doctrine.schema";

const GPU_INDEX_MAPPING: Record<string, number> = {
  TZA: 12,
  SAH: 13,
  COD: 22,
  KEN: 24,
  ZAF: 36,
  NGA: 67,
  CMR: 68,
  BFA: 76,
  MDG: 89,
  DZA: 93,
  MAR: 172,
  EGY: 173,
  LBY: 174,
  ETH: 175,
  DJI: 176,
  SOL: 177,
  SDS: 186,
  CAN: 14,
  USA: 15,
  ARG: 20,
  CHL: 21,
  GRL: 33,
  MEX: 38,
  BRA: 40,
  BOL: 41,
  PER: 42,
  COL: 43,
  GTM: 49,
  PAN: 50,
  VEN: 51,
  ECU: 55,
  CUB: 58,
  KAZ: 16,
  UZB: 17,
  MNG: 108,
  TJK: 115,
  KGZ: 116,
  TKM: 117,
  ISR: 87,
  LBN: 88,
  JOR: 94,
  ARE: 95,
  QAT: 96,
  KWT: 97,
  IRQ: 98,
  OMN: 99,
  IRN: 118,
  SYR: 119,
  YEM: 168,
  SAU: 169,
  ARM: 120,
  AZE: 156,
  PRK: 106,
  KOR: 107,
  CHN: 150,
  TWN: 151,
  JPN: 166,
  IND: 109,
  BGD: 110,
  PAK: 113,
  AFG: 114,
  LKA: 149,
  IDN: 19,
  THA: 102,
  VNM: 105,
  PHL: 158,
  MYS: 159,
  RUS: 29,
  BLR: 122,
  UKR: 123,
  POL: 124,
  HUN: 126,
  ROU: 128,
  BGR: 133,
  SVK: 163,
  CZE: 164,
  NOR: 32,
  SWE: 121,
  IRL: 144,
  DNK: 153,
  GBR: 154,
  ISL: 155,
  FIN: 162,
  GRC: 134,
  TUR: 135,
  HRV: 137,
  PRT: 142,
  ESP: 143,
  ITA: 152,
  CYP: 187,
  SRB: 182,
  FRA: 54,
  AUT: 125,
  DEU: 132,
  CHE: 138,
  BEL: 140,
  NLD: 141,
  NZL: 147,
  AUS: 148,
};

function composeAllCountryProfiles(): CountryProfile[] {
  const codes = Object.keys(COUNTRY_IDENTITY_MAP);
  return codes.map((code) => {
    const idInfo = COUNTRY_IDENTITY_MAP[code]!;
    const population = COUNTRY_DEMOGRAPHICS_MAP[code] ?? 10_000_000;
    const gdp = COUNTRY_GDP_MAP[code] ?? 50_000_000_000;
    const milInfo = COUNTRY_MILITARY_MAP[code] ?? {
      domesticTechLevel: 1.0,
      equipmentTechLevel: 1.0,
    };

    const aiDoctrine = NationDoctrineResolver.resolveDoctrineType(
      code,
      milInfo.domesticTechLevel,
      milInfo.equipmentTechLevel,
      gdp,
    );

    return {
      code,
      nameEn: idInfo.nameEn,
      nameFa: idInfo.nameFa,
      flagCode: idInfo.flagCode,
      startingGovernment: idInfo.startingGovernment,
      gdp,
      population,
      domesticTechLevel: milInfo.domesticTechLevel,
      equipmentTechLevel: milInfo.equipmentTechLevel,
      aiDoctrine,
    };
  });
}

export const ALL_COUNTRY_PROFILES: readonly CountryProfile[] = Object.freeze(
  composeAllCountryProfiles().map((p) => Object.freeze({ ...p })),
);

export class CountryRegistry {
  private static readonly byIso3 = new Map<string, CountryProfile>();
  private static readonly byFlagCode = new Map<string, CountryProfile>();
  private static readonly byGpuIndex = new Map<number, string>();
  private static readonly manifestProfiles = new Map<string, CountryProfile>();
  private static readonly manifestNations = new Map<
    string,
    FinalManifestNation
  >();

  static {
    for (const profile of ALL_COUNTRY_PROFILES) {
      const iso3 = profile.code.toUpperCase();
      this.byIso3.set(iso3, profile);
      if (profile.flagCode) {
        this.byFlagCode.set(profile.flagCode.toUpperCase(), profile);
      }
    }

    for (const [iso3, gpuIndex] of Object.entries(GPU_INDEX_MAPPING)) {
      this.byGpuIndex.set(gpuIndex, iso3);
    }
  }

  public static initializeFromManifest(
    manifest: FinalMapManifest | null,
  ): void {
    this.manifestNations.clear();
    this.manifestProfiles.clear();

    if (!manifest || !Array.isArray(manifest.nations)) return;

    for (const item of manifest.nations) {
      const rawCode = item.code || item.id;
      const str =
        rawCode !== null && rawCode !== undefined ? String(rawCode) : "";
      const iso3 = str.trim().toUpperCase();
      if (!iso3) continue;

      this.manifestNations.set(iso3, item);

      const defaultProfile = this.byIso3.get(iso3);
      const domesticTechLevel =
        defaultProfile?.domesticTechLevel ?? item.startingTechLevel ?? 1;
      const equipmentTechLevel =
        defaultProfile?.equipmentTechLevel ?? domesticTechLevel;

      const aiDoctrine =
        (item.aiDoctrine as AiDoctrineType) ||
        defaultProfile?.aiDoctrine ||
        NationDoctrineResolver.resolveDoctrineType(
          iso3,
          domesticTechLevel,
          equipmentTechLevel,
          item.gdp,
        );

      const dynamicProfile: CountryProfile = {
        code: iso3,
        nameEn: item.nameEn || defaultProfile?.nameEn || iso3,
        nameFa: item.nameFa || defaultProfile?.nameFa || iso3,
        gdp: item.gdp,
        population: item.population,
        flagCode: String(
          item.flagCode || defaultProfile?.flagCode || iso3.slice(0, 2),
        ).toUpperCase(),
        domesticTechLevel,
        equipmentTechLevel,
        startingGovernment:
          item.defaultGovernment as CountryProfile["startingGovernment"],
        startingTechLevel: domesticTechLevel,
        aiDoctrine,
      };

      this.manifestProfiles.set(iso3, dynamicProfile);
      if (item.flagCode) {
        const flagStr = String(item.flagCode).trim().toUpperCase();
        if (flagStr) {
          this.manifestProfiles.set(flagStr, dynamicProfile);
        }
      }
    }
  }

  public static getAllManifestNations(): FinalManifestNation[] {
    return Array.from(this.manifestNations.values());
  }

  public static getCountry(identifier: unknown): CountryProfile | undefined {
    if (identifier === null || identifier === undefined) return undefined;
    const str =
      typeof identifier === "string" ? identifier : String(identifier);
    const clean = str.trim().toUpperCase();
    if (!clean) return undefined;

    const manifestMatch = this.manifestProfiles.get(clean);
    if (manifestMatch) return manifestMatch;

    const iso3Match = this.byIso3.get(clean);
    if (iso3Match) return iso3Match;

    return this.byFlagCode.get(clean);
  }

  public static resolveCanonicalId(identifier: unknown): string {
    if (identifier === null || identifier === undefined) return "IRN";
    const str =
      typeof identifier === "string" ? identifier : String(identifier);
    const clean = str.trim().toUpperCase();
    if (!clean) return "IRN";

    const profile = this.getCountry(clean);
    return profile ? profile.code.toUpperCase() : clean;
  }

  public static getGpuColorIndex(identifier: unknown): number {
    const iso3 = this.resolveCanonicalId(identifier);
    return GPU_INDEX_MAPPING[iso3] ?? 118;
  }

  public static getIso3ByGpuIndex(gpuIndex: number): string | undefined {
    return this.byGpuIndex.get(gpuIndex);
  }
}
