import fs from "fs/promises";
import path from "path";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";
import { PowerScoreCalculator } from "@/engine/diplomacy/power-score-calculator";
import { GovernmentSystem } from "@/engine/politics/government-system";

export interface ManifestNationItem {
  id: string;
  numericId: number;
  code: string;
  flagCode: string;
  nameFa: string;
  nameEn: string;
  gdp: number;
  population: number;
  territorySize: number;
  startingTreasury: number;
  initialRank: number;
  powerScore: number;
  defaultGovernment: string;
}

export interface MapManifest {
  mapId: string;
  totalNationsCount: number;
  nations: ManifestNationItem[];
}

export class MapManifestBuilder {
  private powerCalculator = new PowerScoreCalculator();
  private governmentSystem = new GovernmentSystem();

  public async buildAndSaveManifest(
    mapId: string,
    mappingsCountries: { id: number; areaSqKm: number; code: string }[],
    outputFileName: string,
  ): Promise<MapManifest> {
    const activeCountryIds = new Set(
      mappingsCountries.filter((c) => c.id >= 11).map((c) => c.id),
    );

    const activeProfiles = ALL_COUNTRY_PROFILES.filter((p) =>
      activeCountryIds.has(p.id),
    );

    const rawNationsWithScores = activeProfiles.map((p) => {
      const mapping = mappingsCountries.find((c) => c.id === p.id);
      const territorySize = mapping
        ? mapping.areaSqKm
        : Math.round(p.gdp / 1000000);
      const govType = p.startingGovernment ?? "DEMOCRACY";
      const govTraits = this.governmentSystem.getTraits(govType);

      const computedTreasury = Math.floor(p.gdp * 0.05);

      const powerDetails = this.powerCalculator.calculatePowerScore(
        p.gdp,
        computedTreasury,
        p.startingInfantry ?? 50,
        p.startingAirForce ?? 10,
        p.startingDroneMissile ?? 0,
        p.startingTechLevel ?? 1,
        govTraits.militaryPowerMultiplier,
      );

      return {
        profile: p,
        territorySize,
        powerScore: powerDetails.powerScore,
        computedTreasury,
      };
    });

    rawNationsWithScores.sort((a, b) => b.powerScore - a.powerScore);

    const manifestNations: ManifestNationItem[] = rawNationsWithScores.map(
      (item, index) => ({
        id: `NATION_${item.profile.id}`,
        numericId: item.profile.id,
        code: item.profile.code,
        flagCode: item.profile.flagCode,
        nameFa: item.profile.nameFa,
        nameEn: item.profile.nameEn,
        gdp: item.profile.gdp,
        population: item.profile.population,
        territorySize: item.territorySize,
        startingTreasury: item.computedTreasury,
        initialRank: index + 1,
        powerScore: item.powerScore,
        defaultGovernment: item.profile.startingGovernment ?? "DEMOCRACY",
      }),
    );

    const manifest: MapManifest = {
      mapId,
      totalNationsCount: manifestNations.length,
      nations: manifestNations,
    };

    const publicDir = path.join(process.cwd(), "public");
    const map1Dir = path.join(publicDir, "maps", mapId);
    await fs.mkdir(map1Dir, { recursive: true });
    await fs.writeFile(
      path.join(map1Dir, outputFileName),
      JSON.stringify(manifest, null, 2),
      "utf-8",
    );

    return manifest;
  }
}
