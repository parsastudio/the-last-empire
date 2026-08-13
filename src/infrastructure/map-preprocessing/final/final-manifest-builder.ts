import fs from "fs/promises";
import path from "path";
import { ALL_COUNTRY_PROFILES, CountryProfile } from "@/domain/data/countries";
import { ProvinceClusterInfo } from "@/infrastructure/map-preprocessing/final/province-partition-engine";
import { ServerMapPathResolver } from "@/infrastructure/map-preprocessing/server-map-path-resolver";
import { MilitaryDistributionEngine } from "@/engine/military/military-distribution-engine";

export interface FinalManifestProvince {
  provinceId: number;
  nameFa: string;
  countryId: string;
  countryNumericId: number;
  pixelCount: number;
  hasSeaAccess: boolean;
  landNeighbors: number[];
  centerCoordinates: { x: number; y: number };
}

export interface FinalManifestNation {
  id: string;
  numericId: number;
  code: string;
  flagCode: string;
  nameFa: string;
  nameEn: string;
  gdp: number;
  perCapitaProductivity: number;
  population: number;
  maxPopulationCapacity: number;
  territoryPixelCount: number;
  provinceIds: number[];
  startingTreasury: number;
  initialRank: number;
  defaultGovernment: string;
  startingInfantry: number;
  startingArmor?: number;
  startingAirDefense?: number;
  startingAirForce: number;
  startingDroneMissile: number;
  startingNavalFleet?: number;
  startingTechLevel: number;
  industrialLevel: number;
  infrastructureLevel: number;
  startingStability: number;
}

export interface FinalMapManifest {
  mapId: string;
  totalProvincesCount: number;
  totalNationsCount: number;
  width: number;
  height: number;
  provinces: FinalManifestProvince[];
  nations: FinalManifestNation[];
}

export class FinalManifestBuilder {
  public async buildAndSave(
    mapId: string,
    provinceMap: Map<number, ProvinceClusterInfo>,
    width: number,
    height: number,
  ): Promise<FinalMapManifest> {
    const countryProvincesMap = new Map<number, ProvinceClusterInfo[]>();

    for (const info of provinceMap.values()) {
      let list = countryProvincesMap.get(info.countryNumericId);
      if (!list) {
        list = [];
        countryProvincesMap.set(info.countryNumericId, list);
      }
      list.push(info);
    }

    const manifestProvinces: FinalManifestProvince[] = [];
    const manifestNations: FinalManifestNation[] = [];

    const activeProfiles = ALL_COUNTRY_PROFILES.filter((p: CountryProfile) =>
      countryProvincesMap.has(p.id ?? 0),
    );

    activeProfiles.sort((a, b) => b.gdp - a.gdp);

    for (let rankIndex = 0; rankIndex < activeProfiles.length; rankIndex++) {
      const profile = activeProfiles[rankIndex]!;
      const countryNumericId = profile.id ?? 0;
      const countryId = `NATION_${profile.code.toUpperCase()}`;
      const provList = countryProvincesMap.get(countryNumericId) || [];

      const totalCountryPixels = provList.reduce(
        (sum, p) => sum + p.pixelCount,
        0,
      );
      const provIds: number[] = [];

      for (let pIndex = 0; pIndex < provList.length; pIndex++) {
        const pInfo = provList[pIndex]!;
        provIds.push(pInfo.provinceId);

        manifestProvinces.push({
          provinceId: pInfo.provinceId,
          nameFa: `استان ${profile.nameFa} (${pIndex + 1})`,
          countryId,
          countryNumericId,
          pixelCount: pInfo.pixelCount,
          hasSeaAccess: pInfo.hasSeaAccess,
          landNeighbors: Array.from(pInfo.landNeighbors),
          centerCoordinates: pInfo.centerCoordinates,
        });
      }

      const population = profile.population;
      const gdp = profile.gdp;
      const perCapitaProductivity =
        population > 0 ? Math.floor(gdp / population) : 5000;
      const maxPopulationCapacity = Math.floor(population / 0.95);
      const startingTreasury = Math.floor(gdp * 0.05);

      const defaultGov = profile.startingGovernment ?? "DEMOCRACY";
      const startingStability = 50;

      const militaryTier =
        profile.militaryTier ||
        Math.max(1, Math.min(20, Math.ceil((21 - (rankIndex + 1)) * 0.95)));
      const hasSeaAccess = provList.some((p) => p.hasSeaAccess);
      const startingTech = profile.startingTechLevel;
      const stack = MilitaryDistributionEngine.calculateStartingStack(
        militaryTier,
        hasSeaAccess,
        startingTech,
      );

      const startingInfantry = stack.infantry;
      const startingArmor = stack.armor;
      const startingAirDefense = stack.airDefense;
      const startingAirForce = stack.airForce;
      const startingDroneMissile = stack.droneMissile;
      const startingNavalFleet = stack.navalFleet;
      const techLevel = profile.startingTechLevel ?? stack.techLevel;

      const industrialLevel = Math.max(1, Math.min(5, techLevel));
      const infrastructureLevel = Math.max(1, Math.min(5, techLevel));

      manifestNations.push({
        id: countryId,
        numericId: countryNumericId,
        code: profile.code,
        flagCode: profile.flagCode,
        nameFa: profile.nameFa,
        nameEn: profile.nameEn,
        gdp,
        perCapitaProductivity,
        population,
        maxPopulationCapacity,
        territoryPixelCount: totalCountryPixels,
        provinceIds: provIds,
        startingTreasury,
        initialRank: rankIndex + 1,
        defaultGovernment: defaultGov,
        startingInfantry,
        startingArmor,
        startingAirDefense,
        startingAirForce,
        startingDroneMissile,
        startingNavalFleet,
        startingTechLevel: techLevel,
        industrialLevel,
        infrastructureLevel,
        startingStability,
      });
    }

    const manifest: FinalMapManifest = {
      mapId,
      totalProvincesCount: manifestProvinces.length,
      totalNationsCount: manifestNations.length,
      width,
      height,
      provinces: manifestProvinces,
      nations: manifestNations,
    };

    const targetDir = ServerMapPathResolver.getMapFinalServerDir(mapId);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(
      path.join(targetDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8",
    );

    return manifest;
  }
}
