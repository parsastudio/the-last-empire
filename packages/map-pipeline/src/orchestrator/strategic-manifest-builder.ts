import fs from "fs/promises";
import path from "path";
import {
  ALL_COUNTRY_PROFILES,
  CountryProfile,
  FinalManifestProvince,
  FinalManifestNation,
  FinalMapManifest,
  MilitaryPowerCalculator,
} from "@geopolitics/domain";
import { MilitaryDistributionEngine } from "@geopolitics/game-engine";
import { ProvinceClusterInfo } from "@/infrastructure/core/types/map-pipeline.types";
import { ServerMapPathResolver } from "@/infrastructure/core/io/server-map-path-resolver";

export type { FinalManifestProvince, FinalManifestNation, FinalMapManifest };

interface ProfileRankCandidate {
  profile: CountryProfile;
  gdp: number;
  milPower: number;
  population: number;
  ecoRank: number;
  milRank: number;
  compositeScore: number;
}

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

    const activeProfiles = ALL_COUNTRY_PROFILES.filter((p: CountryProfile) =>
      countryProvincesMap.has(p.id ?? 0),
    );

    const candidates: ProfileRankCandidate[] = activeProfiles.map((p) => {
      const tier = p.militaryTier || 5;
      const stack = MilitaryDistributionEngine.calculateStartingStack(
        tier,
        true,
        p.startingTechLevel,
      );

      const milPower = MilitaryPowerCalculator.calculateEffectivePower(
        {
          id: p.code,
          name: p.nameFa,
          isAi: true,
          isAlive: true,
          flagCode: p.flagCode,
          taxRate: 15,
          tariffRate: 10,
          treasury: 100000,
          nationalDebt: 0,
          industrialLevel: 1,
          government: {
            type: p.startingGovernment || "DEMOCRACY",
            stability: 50,
            turnsInPower: 1,
          },
          military: stack,
          recruitmentQueue: [],
          relations: {},
          activeModifiers: [],
          globalReputation: 50,
          doctrines: { unlockedDoctrines: [] },
          executedEspionageTiers: [],
          warFocusTargetId: null,
        },
        true,
      );

      return {
        profile: p,
        gdp: p.gdp,
        milPower,
        population: p.population,
        ecoRank: 1,
        milRank: 1,
        compositeScore: 0,
      };
    });

    const ecoSorted = [...candidates].sort((a, b) => {
      if (b.gdp !== a.gdp) return b.gdp - a.gdp;
      if (b.population !== a.population) return b.population - a.population;
      return a.profile.code.localeCompare(b.profile.code);
    });
    for (let i = 0; i < ecoSorted.length; i++) {
      ecoSorted[i]!.ecoRank = i + 1;
    }

    const milSorted = [...candidates].sort((a, b) => {
      if (b.milPower !== a.milPower) return b.milPower - a.milPower;
      if (b.gdp !== a.gdp) return b.gdp - a.gdp;
      return a.profile.code.localeCompare(b.profile.code);
    });
    for (let i = 0; i < milSorted.length; i++) {
      milSorted[i]!.milRank = i + 1;
    }

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i]!;
      c.compositeScore = c.ecoRank * 3 + c.milRank * 1;
    }

    candidates.sort((a, b) => {
      if (a.compositeScore !== b.compositeScore) {
        return a.compositeScore - b.compositeScore;
      }
      if (b.gdp !== a.gdp) {
        return b.gdp - a.gdp;
      }
      if (b.population !== a.population) {
        return b.population - a.population;
      }
      return a.profile.code.localeCompare(b.profile.code);
    });

    for (let rankIndex = 0; rankIndex < candidates.length; rankIndex++) {
      const profile = candidates[rankIndex]!.profile;
      const countryNumericId = profile.id ?? 0;
      const countryId = profile.code.toUpperCase();
      const provList = countryProvincesMap.get(countryNumericId) || [];

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
          countryNumericId,
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
        hasSeaAccess,
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

    const targetDir = ServerMapPathResolver.getMapStrategicServerDir(mapId);
    await fs.writeFile(
      path.join(targetDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8",
    );

    return manifest;
  }
}
