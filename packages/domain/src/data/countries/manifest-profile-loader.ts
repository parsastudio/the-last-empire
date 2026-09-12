import { CountryProfile } from "@/domain/data/countries/profile.type";
import {
  FinalMapManifest,
  FinalManifestNation,
} from "@/domain/map/manifest.type";
import { NationDoctrineResolver } from "@/domain/nation/nation-doctrine.config";
import { AiDoctrineType } from "@/domain/nation/nation-doctrine.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";

export class ManifestProfileLoader {
  public static loadManifestData(manifest: FinalMapManifest | null): {
    manifestNations: Map<string, FinalManifestNation>;
    manifestProfiles: Map<string, CountryProfile>;
  } {
    const manifestNations = new Map<string, FinalManifestNation>();
    const manifestProfiles = new Map<string, CountryProfile>();

    if (
      !manifest ||
      !Array.isArray(manifest.nations) ||
      manifest.nations.length === 0
    ) {
      return { manifestNations, manifestProfiles };
    }

    for (const item of manifest.nations) {
      const rawCode = item.code || item.id;
      const str =
        rawCode !== null && rawCode !== undefined ? String(rawCode) : "";
      const iso3 = str.trim().toUpperCase();
      if (!iso3) continue;

      manifestNations.set(iso3, item);

      const domesticTechLevel = item.startingTechLevel ?? 1;
      const equipmentTechLevel = item.equipmentTechLevel ?? domesticTechLevel;
      const industrialLevel = item.industrialLevel ?? domesticTechLevel;

      const aiDoctrine =
        (item.aiDoctrine as AiDoctrineType) ||
        NationDoctrineResolver.resolveDoctrineType(
          iso3,
          domesticTechLevel,
          equipmentTechLevel,
          item.gdp,
        );

      const dynamicProfile: CountryProfile = {
        code: iso3,
        gdp: item.gdp,
        population: item.population,
        flagCode: String(item.flagCode || iso3.slice(0, 2)).toUpperCase(),
        domesticTechLevel,
        equipmentTechLevel,
        industrialLevel,
        startingGovernment: item.defaultGovernment as GovernmentType,
        startingTechLevel: domesticTechLevel,
        aiDoctrine,
        nameEn: item.nameEn,
        nameFa: item.nameFa,
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
