import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { FinalManifestNation as ManifestNationItem } from "@/infrastructure/map-preprocessing/pipeline/05-export/strategic-manifest-builder";
import { MilitaryDistributionEngine } from "@/engine/military/military-distribution-engine";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { MilitaryStack } from "@/domain/military/military.schema";
import { CountryDefaultsUtility } from "@/domain/data/countries/country-defaults.utility";

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
      item.hasSeaAccess ?? true,
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

    let baseMilitary: MilitaryStack = {
      infantry: 0,
      armor: 0,
      airDefense: 0,
      airForce: 0,
      droneMissile: 0,
      navalFleet: 0,
      experience: 10,
      techLevel,
      inventory: {},
    };

    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "INFANTRY",
      infantry,
      techLevel,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "ARMOR",
      armor,
      techLevel,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "AIR_DEFENSE",
      airDefense,
      techLevel,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "AIR_FORCE",
      airForce,
      techLevel,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "DRONE_MISSILE",
      droneMissile,
      techLevel,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "NAVAL_FLEET",
      navalFleet,
      techLevel,
    );

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
      government: {
        type: govType,
        stability: item.startingStability ?? 50,
        turnsInPower: 5,
      },
      military: baseMilitary,
      recruitmentQueue: [],
      geography: {
        landNeighbors: [],
        seaNeighbors: [],
        hasSeaAccess: item.hasSeaAccess ?? true,
        territoryPixelCount: item.territoryPixelCount,
        infrastructureLevel: item.infrastructureLevel,
      },
      relations: {},
      activeModifiers: [],
      globalReputation: 50,
      doctrines: {
        unlockedDoctrines: [],
      },
      regionsDemographics: [defaultRegion],
      provinceIds: item.provinceIds || [],
      executedEspionageTiers: [],
      warFocusTargetId: null,
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

    const fallback = CountryDefaultsUtility.getFallbackProfile(id, profile);
    const tierStack = MilitaryDistributionEngine.calculateStartingStack(
      fallback.militaryTier,
      true,
      fallback.startingTechLevel,
    );

    const fallbackManifestItem: ManifestNationItem = {
      id: canonicalId,
      numericId: profile?.id ?? 0,
      code: fallback.code,
      flagCode: fallback.flagCode,
      nameFa: fallback.nameFa,
      nameEn: fallback.nameEn,
      gdp: fallback.gdp,
      perCapitaProductivity: fallback.perCapitaProductivity,
      population: fallback.population,
      maxPopulationCapacity: fallback.maxPopulationCapacity,
      territoryPixelCount: 1000,
      provinceIds: [],
      hasSeaAccess: true,
      startingTreasury: Math.floor(fallback.gdp * 0.05),
      initialRank: 1,
      defaultGovernment: fallback.startingGovernment,
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
