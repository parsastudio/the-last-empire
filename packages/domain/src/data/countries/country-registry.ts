import { CountryProfile } from "@/domain/data/countries/profile.type";
import {
  FinalMapManifest,
  FinalManifestNation,
} from "@/domain/map/manifest.type";
import { GpuIndexRegistry } from "@/domain/data/countries/gpu-index-registry";
import { ManifestProfileLoader } from "@/domain/data/countries/manifest-profile-loader";
import { ManifestValidator } from "@/domain/data/countries/manifest-validator";

export class CountryRegistry {
  private static manifestProfiles = new Map<string, CountryProfile>();
  private static manifestNations = new Map<string, FinalManifestNation>();

  public static initializeFromManifest(
    manifest: FinalMapManifest | null,
  ): void {
    if (!manifest) return;
    const validated = ManifestValidator.validate(manifest);
    const { manifestNations, manifestProfiles } =
      ManifestProfileLoader.loadManifestData(validated);
    this.manifestNations = manifestNations;
    this.manifestProfiles = manifestProfiles;
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

    return this.manifestProfiles.get(clean);
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
