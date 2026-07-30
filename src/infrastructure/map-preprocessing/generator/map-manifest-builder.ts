import fs from "fs/promises";
import path from "path";
import { ALL_COUNTRY_PROFILES } from "@/infrastructure/data/countries";
import { PowerScoreCalculator } from "@/engine/diplomacy/power-score-calculator";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { MapPathResolver } from "../map-path-resolver";

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
  countries: {
    id: number;
    code: string;
    name: string;
    color: [number, number, number];
    areaSqKm: number;
  }[];
}

export class MapManifestBuilder {
  private powerCalculator = new PowerScoreCalculator();
  private governmentSystem = new GovernmentSystem();

  public async buildAndSaveManifest(
    mapId: string,
    mappingsCountries: {
      id: number;
      areaSqKm: number;
      code: string;
      name: string;
      color: [number, number, number];
    }[],
    outputFileName: string,
  ): Promise<MapManifest> {
    const activeCountryIds = new Set(
      mappingsCountries
        .filter((c) => c.id >= 11 && c.areaSqKm > 0)
        .map((c) => c.id),
    );

    const activeProfiles = ALL_COUNTRY_PROFILES.filter((p) =>
      activeCountryIds.has(p.id ?? 0),
    );

    const rawNationsWithScores = activeProfiles.map((p) => {
      const mapping = mappingsCountries.find((c) => c.id === p.id);
      const numericId = p.id ?? (mapping ? mapping.id : 0);
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
        numericId,
        territorySize,
        powerScore: powerDetails.powerScore,
        computedTreasury,
      };
    });

    rawNationsWithScores.sort((a, b) => b.powerScore - a.powerScore);

    const manifestNations: ManifestNationItem[] = rawNationsWithScores.map(
      (item, index) => ({
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

    const manifest: MapManifest = {
      mapId,
      totalNationsCount: manifestNations.length,
      nations: manifestNations,
      countries: mappingsCountries,
    };

    const targetDir = MapPathResolver.getMapServerDir(mapId);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(
      path.join(targetDir, outputFileName),
      JSON.stringify(manifest, null, 2),
      "utf-8",
    );

    return manifest;
  }
}
