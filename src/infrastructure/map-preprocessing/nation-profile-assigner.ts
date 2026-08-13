import { Nation } from "@/domain/nation/nation.schema";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { FinalManifestNation as ManifestNationItem } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";

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
        stability: item.startingStability ?? 50,
        turnsInPower: 5,
      },
      resources: {},
      military: {
        infantry: item.startingInfantry,
        armor: 0,
        airDefense: 0,
        airForce: item.startingAirForce,
        droneMissile: item.startingDroneMissile,
        navalFleet: 0,
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
    const canonicalId = CountryRegistry.resolveCanonicalId(id);
    const manifestItems = CountryRegistry.getAllManifestNations();
    const found = manifestItems.find(
      (m) =>
        m.id === canonicalId ||
        m.id === id ||
        m.code.toUpperCase() === id.toUpperCase(),
    );

    if (found) {
      return this.buildNationFromManifest(found, isHuman, customGovType);
    }

    const numericId = parseInt(id.replace("NATION_", ""), 10);
    const profile = isNaN(numericId)
      ? CountryRegistry.getCountry(id)
      : CountryRegistry.getCountry(numericId);

    const name = profile ? profile.nameFa : `کشور ${id}`;
    const flagCode = profile ? profile.flagCode : "IR";
    const gdp = profile ? profile.gdp : 100000000000;
    const population = profile ? profile.population : 10000000;

    const fallbackManifestItem: ManifestNationItem = {
      id: canonicalId,
      numericId: profile?.id ?? 0,
      code: profile?.code ?? id,
      flagCode,
      nameFa: name,
      nameEn: profile?.nameEn ?? id,
      gdp,
      perCapitaProductivity: Math.floor(gdp / (population || 1)),
      population,
      maxPopulationCapacity: Math.floor(population / 0.95),
      territoryPixelCount: 1000,
      provinceIds: [],
      startingTreasury: Math.floor(gdp * 0.05),
      initialRank: 1,
      defaultGovernment: profile?.startingGovernment ?? "DEMOCRACY",
      startingInfantry: profile?.startingInfantry ?? 50,
      startingAirForce: profile?.startingAirForce ?? 10,
      startingDroneMissile: profile?.startingDroneMissile ?? 5,
      startingTechLevel: profile?.startingTechLevel ?? 1,
      industrialLevel: 1,
      infrastructureLevel: 1,
      startingStability: 50,
    };

    return this.buildNationFromManifest(
      fallbackManifestItem,
      isHuman,
      customGovType,
    );
  }
}
