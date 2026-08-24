import fs from "fs/promises";
import path from "path";
import {
  ALL_COUNTRY_PROFILES,
  CountryProfile,
  FinalManifestProvince,
  FinalManifestNation,
  FinalMapManifest,
  NationGettersUtility,
  MilitaryPowerCalculator,
} from "@geopolitics/domain";
import { MilitaryDistributionEngine } from "@geopolitics/game-engine";
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

    const activeProfiles = ALL_COUNTRY_PROFILES.filter((p: CountryProfile) =>
      countryProvincesMap.has(p.id ?? 0),
    );

    activeProfiles.sort((a, b) => {
      const stackA = MilitaryDistributionEngine.calculateStartingStack(
        a.militaryTier || 5,
        true,
        a.startingTechLevel,
      );
      const stackB = MilitaryDistributionEngine.calculateStartingStack(
        b.militaryTier || 5,
        true,
        b.startingTechLevel,
      );

      const milA = MilitaryPowerCalculator.calculateEffectivePower(
        {
          id: a.code,
          name: a.nameFa,
          isAi: true,
          isAlive: true,
          flagCode: a.flagCode,
          taxRate: 15,
          tariffRate: 10,
          treasury: 100000,
          nationalDebt: 0,
          industrialLevel: 1,
          government: {
            type: a.startingGovernment || "DEMOCRACY",
            stability: 50,
            turnsInPower: 1,
          },
          military: stackA,
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

      const milB = MilitaryPowerCalculator.calculateEffectivePower(
        {
          id: b.code,
          name: b.nameFa,
          isAi: true,
          isAlive: true,
          flagCode: b.flagCode,
          taxRate: 15,
          tariffRate: 10,
          treasury: 100000,
          nationalDebt: 0,
          industrialLevel: 1,
          government: {
            type: b.startingGovernment || "DEMOCRACY",
            stability: 50,
            turnsInPower: 1,
          },
          military: stackB,
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

      const scoreA = NationGettersUtility.calculateCompositePowerScore(
        a.gdp,
        milA,
      );
      const scoreB = NationGettersUtility.calculateCompositePowerScore(
        b.gdp,
        milB,
      );

      if (Math.abs(scoreB - scoreA) > 0.0001) {
        return scoreB - scoreA;
      }
      return b.gdp - a.gdp;
    });

    for (let rankIndex = 0; rankIndex < activeProfiles.length; rankIndex++) {
      const profile = activeProfiles[rankIndex]!;
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
