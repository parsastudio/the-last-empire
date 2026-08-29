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
import { GpuIndexRegistry } from "@/domain/data/countries/gpu-index-registry";

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
    return GpuIndexRegistry.getGpuColorIndex(iso3);
  }

  public static getIso3ByGpuIndex(gpuIndex: number): string | undefined {
    return GpuIndexRegistry.getIso3ByGpuIndex(gpuIndex);
  }
}
