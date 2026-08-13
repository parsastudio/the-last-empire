import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { FinalManifestNation as ManifestNationItem } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { MilitaryDistributionEngine } from "@/engine/military/military-distribution-engine";

type GovernmentType = Nation["government"]["type"];

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

    const defaultRegion = {
      regionId: 0,
      name: `خاک اصلی ${item.nameFa}`,
      pixelCount: item.territoryPixelCount,
      population: item.population,
    };

    const profile =
      CountryRegistry.getCountry(item.id) ||
      CountryRegistry.getCountry(item.code);
    const tier =
      profile?.militaryTier ?? Math.max(1, Math.min(20, 21 - item.initialRank));
    const startingTech = profile?.startingTechLevel ?? item.startingTechLevel;
    const tierStack = MilitaryDistributionEngine.calculateStartingStack(
      tier,
      true,
      startingTech,
    );

    const infantry =
      item.startingInfantry > 0 ? item.startingInfantry : tierStack.infantry;
    const armor = item.startingArmor ?? tierStack.armor;
    const airDefense = item.startingAirDefense ?? tierStack.airDefense;
    const airForce =
      item.startingAirForce > 0 ? item.startingAirForce : tierStack.airForce;
    const droneMissile =
      item.startingDroneMissile > 0
        ? item.startingDroneMissile
        : tierStack.droneMissile;
    const navalFleet = item.startingNavalFleet ?? tierStack.navalFleet;
    const techLevel =
      startingTech && startingTech > 0
        ? startingTech
        : item.startingTechLevel > 1
          ? item.startingTechLevel
          : tierStack.techLevel;

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

    const tier = profile?.militaryTier ?? 5;
    const startingTech = profile?.startingTechLevel;
    const tierStack = MilitaryDistributionEngine.calculateStartingStack(
      tier,
      true,
      startingTech,
    );

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
      startingInfantry: tierStack.infantry,
      startingArmor: tierStack.armor,
      startingAirDefense: tierStack.airDefense,
      startingAirForce: tierStack.airForce,
      startingDroneMissile: tierStack.droneMissile,
      startingNavalFleet: tierStack.navalFleet,
      startingTechLevel: tierStack.techLevel,
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
