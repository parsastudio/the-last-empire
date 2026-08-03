import fs from "fs/promises";
import path from "path";
import { ALL_COUNTRY_PROFILES, CountryProfile } from "@/domain/data/countries";
import { PowerScoreCalculator } from "@/engine/diplomacy/power-score-calculator";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export interface FinalManifestNation {
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

export interface FinalMapManifest {
  mapId: string;
  totalNationsCount: number;
  width: number;
  height: number;
  nations: FinalManifestNation[];
}

export class FinalManifestBuilder {
  private powerCalculator = new PowerScoreCalculator();

  public async buildAndSave(
    mapId: string,
    activeCountryIds: Set<number>,
    pixelAreaMap: Map<number, number>,
    width: number,
    height: number,
  ): Promise<FinalMapManifest> {
    const activeProfiles = ALL_COUNTRY_PROFILES.filter((p: CountryProfile) =>
      activeCountryIds.has(p.id ?? 0),
    );

    const rawNationsWithScores = activeProfiles.map((p: CountryProfile) => {
      const numericId = p.id ?? 0;
      const measuredArea = pixelAreaMap.get(numericId) || 0;
      const territorySize =
        measuredArea > 0
          ? Math.round(measuredArea)
          : Math.round(p.gdp / 10000000);
      const computedTreasury = Math.floor(p.gdp * 0.05);

      const powerDetails = this.powerCalculator.calculatePowerScore(
        p.gdp,
        computedTreasury,
        p.startingInfantry ?? 50,
        p.startingAirForce ?? 10,
        p.startingDroneMissile ?? 0,
        p.startingTechLevel ?? 1,
        1.0,
      );

      return {
        profile: p,
        numericId,
        territorySize,
        powerScore: powerDetails.powerScore,
        computedTreasury,
      };
    });

    rawNationsWithScores.sort(
      (a: { powerScore: number }, b: { powerScore: number }) =>
        b.powerScore - a.powerScore,
    );

    const manifestNations: FinalManifestNation[] = rawNationsWithScores.map(
      (
        item: {
          profile: CountryProfile;
          numericId: number;
          territorySize: number;
          powerScore: number;
          computedTreasury: number;
        },
        index: number,
      ) => ({
        id: `NATION_${item.profile.code}`,
        numericId: item.numericId,
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

    const manifest: FinalMapManifest = {
      mapId,
      totalNationsCount: manifestNations.length,
      width,
      height,
      nations: manifestNations,
    };

    const targetDir = MapPathResolver.getMapFinalServerDir(mapId);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(
      path.join(targetDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8",
    );

    return manifest;
  }
}
