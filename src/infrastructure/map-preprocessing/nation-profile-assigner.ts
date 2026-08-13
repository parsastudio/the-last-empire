import { Nation } from "@/domain/nation/nation.schema";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";
import {
  findCountryProfileById,
  findCountryProfileByCode,
} from "@/domain/data/countries";
import { FinalManifestNation as ManifestNationItem } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { GameError } from "@/domain/shared/domain-utilities";

export class NationProfileAssigner {
  public buildNationFromManifest(
    item: ManifestNationItem,
    isHuman: boolean,
    customGovType?: GovernmentType | string,
  ): Nation {
    const validGovTypes: GovernmentType[] = [
      "DEMOCRACY",
      "DICTATORSHIP",
      "MONARCHY",
      "COMMUNISM",
      "FASCISM",
    ];

    let govType: GovernmentType =
      (item.defaultGovernment as GovernmentType) ?? "DEMOCRACY";
    if (
      customGovType &&
      validGovTypes.includes(customGovType as GovernmentType)
    ) {
      govType = customGovType as GovernmentType;
    }

    const stability = 50;

    const defaultRegion: RegionDemographics = {
      regionId: 0,
      name: `خاک اصلی ${item.nameFa}`,
      pixelCount: item.territoryPixelCount,
      population: item.population,
    };

    return {
      id: item.id,
      name: item.nameFa,
      isAi: !isHuman,
      isAlive: true,
      flagCode: item.flagCode,
      rank: item.initialRank,
      perCapitaProductivity: item.perCapitaProductivity,
      maxPopulationCapacity: item.maxPopulationCapacity,
      taxRate: 15,
      tariffRate: 10,
      treasury: item.startingTreasury,
      nationalDebt: 0,
      population: item.population,
      industrialLevel: item.industrialLevel,
      consecutiveDeficitTurns: 0,
      government: {
        type: govType,
        stability,
        turnsInPower: 5,
      },
      resources: {},
      military: {
        infantry: item.startingInfantry,
        armor: Math.floor(item.startingInfantry * 0.2),
        airDefense: Math.floor(item.startingInfantry * 0.1),
        airForce: item.startingAirForce,
        droneMissile: item.startingDroneMissile,
        navalFleet: Math.floor(item.startingAirForce * 0.2),
        experience: 10,
        techLevel: item.startingTechLevel,
      },
      recruitmentQueue: [],
      geography: {
        landNeighbors: [],
        seaNeighbors: [],
        hasSeaAccess: true,
        territoryPixelCount: item.territoryPixelCount,
        infrastructureLevel: item.infrastructureLevel,
        contiguousMainlandPixelCount: item.territoryPixelCount,
        isolatedPockets: [],
        coordinates: [],
      },
      relations: {},
      activeModifiers: [],
      globalReputation: 50,
      doctrines: {
        unlockedDoctrines: [],
      },
      proxyInfluenceBudget: {},
      regionsDemographics: [defaultRegion],
      provinceIds: item.provinceIds || [],
    };
  }

  public buildStartingNation(
    id: string,
    isHuman: boolean,
    customGovType?: GovernmentType | string,
  ): Nation {
    const numericId = parseInt(id.replace("NATION_", ""), 10);
    const profile = isNaN(numericId)
      ? findCountryProfileByCode(id)
      : findCountryProfileById(numericId);

    if (!profile) {
      throw new GameError(
        "NATION_NOT_FOUND",
        `پروفایل شناسنامه کشوری برای شناسه ${id} یافت نشد.`,
      );
    }

    const gdp = profile.gdp;
    const population = profile.population;
    const perCapitaProductivity =
      population > 0 ? Math.floor(gdp / population) : 5000;

    const treasury = Math.floor(gdp * 0.05);
    const name = profile.nameFa;
    const flagCode = profile.flagCode;

    const isTier1 = profile.gdp >= 1000000000000;

    const validGovTypes: GovernmentType[] = [
      "DEMOCRACY",
      "DICTATORSHIP",
      "MONARCHY",
      "COMMUNISM",
      "FASCISM",
    ];

    let govType: GovernmentType = profile.startingGovernment ?? "DEMOCRACY";
    if (
      customGovType &&
      validGovTypes.includes(customGovType as GovernmentType)
    ) {
      govType = customGovType as GovernmentType;
    }

    const stability = 50;

    const techLevel = profile.startingTechLevel ?? 1;
    const industrialLevel = Math.max(1, Math.min(5, techLevel));
    const infrastructureLevel = Math.max(1, Math.min(5, techLevel));

    const infantry = profile.startingInfantry ?? (isTier1 ? 200 : 40);
    const armor = isTier1 ? 50 : 10;
    const airDefense = isTier1 ? 30 : 5;
    const airForce = profile.startingAirForce ?? (isTier1 ? 45 : 5);
    const droneMissile = profile.startingDroneMissile ?? (isTier1 ? 10 : 0);
    const navalFleet = isTier1 ? 15 : 2;

    const territoryPixelCount = Math.max(
      100,
      Math.round(profile.gdp / 1000000000),
    );
    const maxPopulationCapacity = Math.floor(population / 0.95);

    const defaultRegion: RegionDemographics = {
      regionId: 0,
      name: `خاک اصلی ${name}`,
      pixelCount: territoryPixelCount,
      population,
    };

    return {
      id,
      name,
      isAi: !isHuman,
      isAlive: true,
      flagCode,
      rank: 1,
      perCapitaProductivity,
      maxPopulationCapacity,
      taxRate: 15,
      tariffRate: 10,
      treasury,
      nationalDebt: 0,
      population,
      industrialLevel,
      consecutiveDeficitTurns: 0,
      government: {
        type: govType,
        stability,
        turnsInPower: 5,
      },
      resources: {},
      military: {
        infantry,
        armor,
        airDefense,
        airForce,
        droneMissile,
        navalFleet,
        experience: 10,
        techLevel,
      },
      recruitmentQueue: [],
      geography: {
        landNeighbors: [],
        seaNeighbors: [],
        hasSeaAccess: true,
        territoryPixelCount,
        infrastructureLevel,
        contiguousMainlandPixelCount: territoryPixelCount,
        isolatedPockets: [],
        coordinates: [],
      },
      relations: {},
      activeModifiers: [],
      globalReputation: 50,
      doctrines: {
        unlockedDoctrines: [],
      },
      proxyInfluenceBudget: {},
      regionsDemographics: [defaultRegion],
      provinceIds: [],
    };
  }
}
