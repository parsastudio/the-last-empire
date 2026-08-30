import { CountryProfile } from "@/domain/data/countries/profile.type";
import {
  FinalMapManifest,
  FinalManifestNation,
} from "@/domain/map/manifest.type";
import { NationDoctrineResolver } from "@/domain/nation/nation-doctrine.config";
import { AiDoctrineType } from "@/domain/nation/nation-doctrine.schema";

export class ManifestProfileLoader {
  public static loadManifestData(
    manifest: FinalMapManifest | null,
    byIso3Map: Map<string, CountryProfile>,
  ): {
    manifestNations: Map<string, FinalManifestNation>;
    manifestProfiles: Map<string, CountryProfile>;
  } {
    const manifestNations = new Map<string, FinalManifestNation>();
    const manifestProfiles = new Map<string, CountryProfile>();

    if (!manifest || !Array.isArray(manifest.nations)) {
      return { manifestNations, manifestProfiles };
    }

    for (const item of manifest.nations) {
      const rawCode = item.code || item.id;
      const str =
        rawCode !== null && rawCode !== undefined ? String(rawCode) : "";
      const iso3 = str.trim().toUpperCase();
      if (!iso3) continue;

      manifestNations.set(iso3, item);

      const defaultProfile = byIso3Map.get(iso3);
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

      manifestProfiles.set(iso3, dynamicProfile);
      if (item.flagCode) {
        const flagStr = String(item.flagCode).trim().toUpperCase();
        if (flagStr) {
          manifestProfiles.set(flagStr, dynamicProfile);
        }
      }
    }

    return { manifestNations, manifestProfiles };
  }
}
