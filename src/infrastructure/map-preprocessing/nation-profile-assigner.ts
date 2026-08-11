import { Nation } from "@/domain/nation/nation.schema";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";
import {
  findCountryProfileById,
  findCountryProfileByCode,
} from "@/domain/data/countries";
import { FinalManifestNation as ManifestNationItem } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";

export class NationProfileAssigner {
  public buildNationFromManifest(
    item: ManifestNationItem,
    isHuman: boolean,
    customGovType?: GovernmentType | string,
  ): Nation {
    const numericId = item.numericId;
    const profile = findCountryProfileById(numericId);

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

    let stability = 80;

    if (govType === "MONARCHY") {
      stability = 85;
    } else if (govType === "COMMUNISM") {
      stability = 75;
    } else if (govType === "DICTATORSHIP") {
      stability = 55;
    } else if (govType === "FASCISM") {
      stability = 60;
    }

    const techLevel = profile?.startingTechLevel ?? 1;
    const industrialLevel = Math.max(1, Math.min(5, techLevel));
    const infrastructureLevel = Math.max(1, Math.min(5, techLevel));

    const computedGdp = item.perCapitaProductivity * item.population;
    const isTier1 = computedGdp >= 1000000000000;

    const infantry = profile?.startingInfantry ?? (isTier1 ? 200 : 40);
    const airForce = profile?.startingAirForce ?? (isTier1 ? 45 : 5);
    const droneMissile = profile?.startingDroneMissile ?? (isTier1 ? 10 : 0);

    const calculatedTreasury = Math.floor(computedGdp * 0.05);
    const perCapitaProductivity = item.perCapitaProductivity;
    const maxPopulationCapacity = Math.floor(item.population / 0.95);

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
      perCapitaProductivity,
      maxPopulationCapacity,
      taxRate: 15,
      tariffRate: 10,
      treasury: calculatedTreasury,
      nationalDebt: 0,
      population: item.population,
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
        airForce,
        droneMissile,
        experience: 10,
        techLevel,
      },
      recruitmentQueue: [],
      geography: {
        landNeighbors: [],
        seaNeighbors: [],
        hasSeaAccess: true,
        territoryPixelCount: item.territoryPixelCount,
        infrastructureLevel,
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
    let profile = isNaN(numericId)
      ? findCountryProfileByCode(id)
      : findCountryProfileById(numericId);

    if (!profile && isNaN(numericId)) {
      profile = findCountryProfileById(118);
    }

    const gdp = profile ? profile.gdp : 5000000000;
    const population = profile ? profile.population : 80000000;
    const treasury = Math.floor(gdp * 0.05);
    const name = profile ? profile.nameFa : `قلمرو مستقل ${id}`;
    const flagCode = profile ? profile.flagCode : "IR";

    const isTier1 = profile ? profile.gdp >= 1000000000000 : false;

    const validGovTypes: GovernmentType[] = [
      "DEMOCRACY",
      "DICTATORSHIP",
      "MONARCHY",
      "COMMUNISM",
      "FASCISM",
    ];

    let govType: GovernmentType = profile?.startingGovernment ?? "DEMOCRACY";
    if (
      customGovType &&
      validGovTypes.includes(customGovType as GovernmentType)
    ) {
      govType = customGovType as GovernmentType;
    }

    let stability = 80;

    if (govType === "MONARCHY") {
      stability = 85;
    } else if (govType === "COMMUNISM") {
      stability = 75;
    } else if (govType === "DICTATORSHIP") {
      stability = 55;
    } else if (govType === "FASCISM") {
      stability = 60;
    }

    const techLevel = profile?.startingTechLevel ?? 1;
    const industrialLevel = Math.max(1, Math.min(5, techLevel));
    const infrastructureLevel = Math.max(1, Math.min(5, techLevel));

    const infantry = profile?.startingInfantry ?? (isTier1 ? 200 : 40);
    const airForce = profile?.startingAirForce ?? (isTier1 ? 45 : 5);
    const droneMissile = profile?.startingDroneMissile ?? (isTier1 ? 10 : 0);

    const territoryPixelCount = profile
      ? Math.round(profile.gdp / 10000000)
      : 4000;

    const perCapitaProductivity =
      population > 0 ? Math.floor(gdp / population) : 5000;
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
        airForce,
        droneMissile,
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
