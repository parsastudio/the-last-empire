import { CountryProfile } from "@/domain/data/countries/profile.type";
import { COUNTRY_IDENTITY_MAP } from "@/domain/data/countries/sources/country-identity.data";
import { COUNTRY_DEMOGRAPHICS_MAP } from "@/domain/data/countries/sources/country-demographics.data";
import { COUNTRY_GDP_MAP } from "@/domain/data/countries/sources/country-economy.data";
import { COUNTRY_MILITARY_MAP } from "@/domain/data/countries/sources/country-military.data";
import { COUNTRY_INDUSTRY_MAP } from "@/domain/data/countries/sources/country-industry.data";
import {
  FinalMapManifest,
  FinalManifestNation,
} from "@/domain/map/manifest.type";
import { GpuIndexRegistry } from "@/domain/data/countries/gpu-index-registry";
import { ManifestProfileLoader } from "@/domain/data/countries/manifest-profile-loader";
import { ManifestValidator } from "@/domain/data/countries/manifest-validator";
import { NationDoctrineResolver } from "@/domain/nation/nation-doctrine.config";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";

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
    const indInfo = COUNTRY_INDUSTRY_MAP[code] ?? {
      industrialLevel: milInfo.domesticTechLevel,
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
      industrialLevel: indInfo.industrialLevel,
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
  private static readonly canonicalCache = new Map<string, string>();
  private static manifestProfiles = new Map<string, CountryProfile>();
  private static manifestNations = new Map<string, FinalManifestNation>();

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
    if (!manifest) return;
    this.canonicalCache.clear();
    const validated = ManifestValidator.validate(manifest);
    const { manifestNations, manifestProfiles } =
      ManifestProfileLoader.loadManifestData(validated);
    this.manifestNations = manifestNations;
    this.manifestProfiles = manifestProfiles;
    MapTopologyRegistry.initializeFromManifest(validated);
  }

  public static getAllManifestNations(): FinalManifestNation[] {
    return Array.from(this.manifestNations.values());
  }

  public static getAllProfiles(): CountryProfile[] {
    return Array.from(this.manifestProfiles.values());
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

  public static requireCountry(identifier: unknown): CountryProfile {
    const profile = this.getCountry(identifier);
    if (!profile) {
      throw new Error(
        `شناسنامه کشور با نماد یا شناسه "${String(identifier)}" در مانیفست استراتژیک نقشه یافت نشد.`,
      );
    }
    return profile;
  }

  public static resolveCanonicalId(identifier: unknown): string {
    if (identifier === null || identifier === undefined) return "";
    const str =
      typeof identifier === "string" ? identifier : String(identifier);
    const clean = str.trim().toUpperCase();
    if (!clean) return "";

    const cached = this.canonicalCache.get(clean);
    if (cached !== undefined) {
      return cached;
    }

    let resolved = clean;
    const manifestMatch = this.manifestProfiles.get(clean);
    if (manifestMatch) {
      resolved = manifestMatch.code.toUpperCase();
    } else {
      const iso3Match = this.byIso3.get(clean);
      if (iso3Match) {
        resolved = iso3Match.code.toUpperCase();
      } else {
        const flagMatch = this.byFlagCode.get(clean);
        if (flagMatch) {
          resolved = flagMatch.code.toUpperCase();
        }
      }
    }

    this.canonicalCache.set(clean, resolved);
    return resolved;
  }

  public static getGpuColorIndex(identifier: unknown): number {
    const iso3 = this.resolveCanonicalId(identifier);
    return GpuIndexRegistry.getGpuColorIndex(iso3);
  }

  public static getIso3ByGpuIndex(gpuIndex: number): string | undefined {
    return GpuIndexRegistry.getIso3ByGpuIndex(gpuIndex);
  }
}
