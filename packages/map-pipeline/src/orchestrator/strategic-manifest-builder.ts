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
  IndustryCalculator,
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

    const activeProfiles: CountryProfile[] = ALL_COUNTRY_PROFILES.filter(
      (p: CountryProfile): boolean => {
        const gpuIdx = CountryRegistry.getGpuColorIndex(p.code);
        return countryProvincesMap.has(gpuIdx);
      },
    );

    const candidatesInput: NationRankCandidateInput[] = activeProfiles.map(
      (p: CountryProfile): NationRankCandidateInput => {
        return {
          id: p.code,
          gdp: p.gdp,
          population: p.population,
          domesticTechLevel: p.domesticTechLevel,
          equipmentTechLevel: p.equipmentTechLevel,
          industrialLevel: p.industrialLevel,
          startingTechLevel: p.startingTechLevel ?? p.domesticTechLevel,
        };
      },
    );

    const globalRankMap =
      NationGettersUtility.calculateRankMapFromCandidates(candidatesInput);

    activeProfiles.sort((a: CountryProfile, b: CountryProfile): number => {
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
      const domesticTech =
        profile.domesticTechLevel ?? profile.startingTechLevel ?? 1.0;
      const militaryEquipmentTech = profile.equipmentTechLevel ?? domesticTech;
      const industrialLevel = profile.industrialLevel ?? domesticTech;
      const computedRank = globalRankMap.get(profile.code) ?? rankIndex + 1;

      const totalActiveFactories =
        IndustryCalculator.calculateStartingTotalFactories(
          gdp,
          industrialLevel,
        );

      const totalMaxSlots = IndustryCalculator.calculateStartingMaxSlots(
        totalActiveFactories,
        computedRank,
        activeProfiles.length,
      );

      const slotDistribution =
        IndustryCalculator.distributeFactoriesAndSlotsToProvinces(
          totalActiveFactories,
          totalMaxSlots,
          provCount,
        );

      const startingTreasury = Math.floor(gdp * 0.05);
      const equalPopulationShare = Math.floor(population / provCount);

      let distributedPopulation = 0;

      for (let pIndex = 0; pIndex < provList.length; pIndex++) {
        const pInfo = provList[pIndex]!;
        provIds.push(pInfo.provinceId);

        const isLast = pIndex === provList.length - 1;
        const provPopulation = isLast
          ? Math.max(1, population - distributedPopulation)
          : Math.max(1, equalPopulationShare);

        distributedPopulation += provPopulation;
        const slotPair = slotDistribution[pIndex] ?? {
          activeCount: 1,
          maxSlots: 1,
        };

        manifestProvinces.push({
          provinceId: pInfo.provinceId,
          provinceIndex: pIndex + 1,
          nameFa: profile.nameFa ?? "",
          countryId,
          originalCountryId: countryId,
          pixelCount: pInfo.pixelCount,
          hasSeaAccess: pInfo.hasSeaAccess,
          landNeighbors: Array.from(pInfo.landNeighbors),
          maritimeNeighborsTier1: [],
          maritimeNeighborsTier2: [],
          centerCoordinates: pInfo.centerCoordinates,
          population: provPopulation,
          maxSlots: slotPair.maxSlots,
          factoriesCount: slotPair.activeCount,
        });
      }

      const defaultGov =
        profile.startingGovernment ?? "PLURALIST_PARLIAMENTARY";
      const startingStability = 50;
      const hasSeaAccess = provList.some((p) => p.hasSeaAccess);

      const stack = MilitaryDistributionEngine.calculateStartingStack(
        gdp,
        domesticTech,
        militaryEquipmentTech,
      );

      manifestNations.push({
        id: countryId,
        code: profile.code,
        flagCode: profile.flagCode,
        nameFa: profile.nameFa,
        nameEn: profile.nameEn,
        gdp,
        population,
        territoryPixelCount: totalCountryPixels,
        provinceIds: provIds,
        hasSeaAccess,
        startingTreasury,
        initialRank: computedRank,
        defaultGovernment: defaultGov,
        startingInfantry: stack.infantry,
        startingArmor: stack.armor,
        startingAirDefense: stack.airDefense,
        startingAirForce: stack.airForce,
        startingDroneMissile: stack.droneMissile,
        startingTechLevel: domesticTech,
        industrialLevel,
        equipmentTechLevel: militaryEquipmentTech,
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
