import { CountryProfile } from "@/domain/data/countries/profile.type";
import { ALL_RAW_COUNTRY_PROFILES } from "@/domain/data/countries/country-profiles.data";
import {
  FinalMapManifest,
  FinalManifestNation,
} from "@/infrastructure/map-preprocessing/pipeline/05-export/strategic-manifest-builder";

const ID_MAPPING: Record<string, number> = {
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
  TTO: 185,
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
  KOS: 184,
  FRA: 54,
  AUT: 125,
  DEU: 132,
  CHE: 138,
  BEL: 140,
  NLD: 141,
  NZL: 147,
  AUS: 148,
};

export const ALL_COUNTRY_PROFILES: CountryProfile[] =
  ALL_RAW_COUNTRY_PROFILES.map((p) => ({
    ...p,
    id: p.id ?? ID_MAPPING[p.code] ?? 0,
  }));

export class CountryRegistry {
  private static readonly byNumericId = new Map<number, CountryProfile>();
  private static readonly byCode = new Map<string, CountryProfile>();
  private static manifestNations = new Map<string, FinalManifestNation>();

  static {
    for (const profile of ALL_COUNTRY_PROFILES) {
      if (profile.id) {
        this.byNumericId.set(profile.id, profile);
      }
      const iso3 = profile.code.toUpperCase();
      this.byCode.set(iso3, profile);
      if (profile.flagCode) {
        this.byCode.set(profile.flagCode.toUpperCase(), profile);
      }
    }
  }

  public static initializeFromManifest(
    manifest: FinalMapManifest | null,
  ): void {
    if (!manifest || !Array.isArray(manifest.nations)) return;
    this.manifestNations.clear();
    for (const item of manifest.nations) {
      const code = item.code.toUpperCase();
      this.manifestNations.set(code, item);
      if (item.id) {
        this.manifestNations.set(item.id.toUpperCase(), item);
      }
      if (item.flagCode) {
        this.manifestNations.set(item.flagCode.toUpperCase(), item);
      }
      const profile = this.getCountry(item.code);
      if (profile) {
        profile.gdp = item.gdp;
        profile.population = item.population;
        profile.startingGovernment =
          item.defaultGovernment as CountryProfile["startingGovernment"];
        profile.startingTechLevel = item.startingTechLevel;
      }
    }
  }

  public static getAllManifestNations(): FinalManifestNation[] {
    const list: FinalManifestNation[] = [];
    const seen = new Set<string>();
    for (const item of this.manifestNations.values()) {
      const code = item.code.toUpperCase();
      if (!seen.has(code)) {
        seen.add(code);
        list.push(item);
      }
    }
    return list;
  }

  public static getCountry(
    identifier: string | number,
  ): CountryProfile | undefined {
    if (identifier === null || identifier === undefined || identifier === "") {
      return undefined;
    }

    if (typeof identifier === "number") {
      return this.byNumericId.get(identifier);
    }

    const clean = identifier
      .toString()
      .trim()
      .toUpperCase()
      .replace(/^NATION_/, "");

    const codeMatch = this.byCode.get(clean);
    if (codeMatch) return codeMatch;

    const parsedNum = parseInt(clean, 10);
    if (!isNaN(parsedNum)) {
      const numMatch = this.byNumericId.get(parsedNum);
      if (numMatch) return numMatch;
    }

    return undefined;
  }

  public static resolveCanonicalId(identifier: string | number): string {
    const profile = this.getCountry(identifier);
    if (profile) {
      return profile.code.toUpperCase();
    }
    return identifier
      .toString()
      .trim()
      .toUpperCase()
      .replace(/^NATION_/, "");
  }

  public static resolveNumericId(identifier: string | number): number {
    if (typeof identifier === "number") {
      return identifier;
    }
    const profile = this.getCountry(identifier);
    if (profile && profile.id) {
      return profile.id;
    }
    const clean = identifier
      .toString()
      .trim()
      .toUpperCase()
      .replace(/^NATION_/, "");
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}
