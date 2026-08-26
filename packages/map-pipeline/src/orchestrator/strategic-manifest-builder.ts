import fs from "fs/promises";
import path from "path";
import {
  ALL_COUNTRY_PROFILES,
  CountryProfile,
  FinalManifestProvince,
  FinalManifestNation,
  FinalMapManifest,
  NationGettersUtility,
  NationRankCandidateInput,
  CountryRegistry,
} from "@geopolitics/domain";
import { MilitaryDistributionEngine } from "@geopolitics/domain";
import { ProvinceClusterInfo } from "@/infrastructure/core/types/map-pipeline.types";
import { ServerMapPathResolver } from "@/infrastructure/core/io/server-map-path-resolver";

export type { FinalManifestProvince, FinalManifestNation, FinalMapManifest };

export class StrategicManifestBuilder {
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

    const activeProfiles = ALL_COUNTRY_PROFILES.filter((p: CountryProfile) => {
      const gpuIdx = CountryRegistry.getGpuColorIndex(p.code);
      return countryProvincesMap.has(gpuIdx);
    });

    const candidatesInput: NationRankCandidateInput[] = activeProfiles.map(
      (p) => {
        const gpuIdx = CountryRegistry.getGpuColorIndex(p.code);
        return {
          id: p.code,
          name: p.nameFa,
          gdp: p.gdp,
          population: p.population,
          governmentType: p.startingGovernment,
          militaryTier: p.militaryTier,
          startingTechLevel: p.startingTechLevel,
          hasSeaAccess: (countryProvincesMap.get(gpuIdx) || []).some(
            (prov) => prov.hasSeaAccess,
          ),
        };
      },
    );

    const globalRankMap =
      NationGettersUtility.calculateRankMapFromCandidates(candidatesInput);

    activeProfiles.sort((a, b) => {
      const rankA = globalRankMap.get(a.code) ?? 999;
      const rankB = globalRankMap.get(b.code) ?? 999;
      return rankA - rankB;
    });

    for (let rankIndex = 0; rankIndex < activeProfiles.length; rankIndex++) {
      const profile = activeProfiles[rankIndex]!;
      const gpuIdx = CountryRegistry.getGpuColorIndex(profile.code);
      const countryId = profile.code.toUpperCase();
      const provList = countryProvincesMap.get(gpuIdx) || [];

      const totalCountryPixels = provList.reduce(
        (sum, p) => sum + p.pixelCount,
        0,
      );
      const provIds: number[] = [];
      const provCount = Math.max(1, provList.length);

      const population = profile.population;
      const gdp = profile.gdp;
      const perCapitaProductivity =
        population > 0 ? Math.floor(gdp / population) : 5000;
      const maxPopulationCapacity = Math.floor(population / 0.95);
      const startingTreasury = Math.floor(gdp * 0.05);

      const equalPopulationShare = Math.floor(population / provCount);
      const equalCapacityShare = Math.floor(maxPopulationCapacity / provCount);

      let distributedPopulation = 0;
      let distributedCapacity = 0;

      for (let pIndex = 0; pIndex < provList.length; pIndex++) {
        const pInfo = provList[pIndex]!;
        provIds.push(pInfo.provinceId);

        const isLast = pIndex === provList.length - 1;

        const provPopulation = isLast
          ? Math.max(1, population - distributedPopulation)
          : Math.max(1, equalPopulationShare);

        const provCapacity = isLast
          ? Math.max(
              provPopulation,
              maxPopulationCapacity - distributedCapacity,
            )
          : Math.max(provPopulation, equalCapacityShare);

        distributedPopulation += provPopulation;
        distributedCapacity += provCapacity;

        manifestProvinces.push({
          provinceId: pInfo.provinceId,
          nameFa: `استان ${profile.nameFa} (${pIndex + 1})`,
          countryId,
          originalCountryId: countryId,
          pixelCount: pInfo.pixelCount,
          hasSeaAccess: pInfo.hasSeaAccess,
          landNeighbors: Array.from(pInfo.landNeighbors),
          maritimeNeighborsTier1: [],
          maritimeNeighborsTier2: [],
          centerCoordinates: pInfo.centerCoordinates,
          population: provPopulation,
          perCapitaProductivity,
          maxPopulationCapacity: provCapacity,
        });
      }

      const defaultGov = profile.startingGovernment ?? "DEMOCRACY";
      const startingStability = 50;

      const militaryTier = profile.militaryTier || 5;
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
      const computedRank = globalRankMap.get(profile.code) ?? rankIndex + 1;

      manifestNations.push({
        id: countryId,
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
        hasSeaAccess,
        startingTreasury,
        initialRank: computedRank,
        defaultGovernment: defaultGov,
        startingInfantry,
        startingArmor,
        startingAirDefense,
        startingAirForce,
        startingDroneMissile,
        startingNavalFleet,
        startingTechLevel: techLevel,
        industrialLevel,
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

    const targetDir = ServerMapPathResolver.getMapStrategicServerDir(mapId);
    await fs.writeFile(
      path.join(targetDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8",
    );

    return manifest;
  }
}
