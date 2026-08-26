import {
  Nation,
  CountryRegistry,
  FinalManifestNation,
  MilitaryInventoryHelper,
  MilitaryStack,
  CountryDefaultsUtility,
} from "@geopolitics/domain";
import { MilitaryDistributionEngine } from "@/engine/military/military-distribution-engine";

type GovernmentType = Nation["government"]["type"];

export class NationProfileAssigner {
  public buildNationFromManifest(
    item: FinalManifestNation,
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

    const cleanId = CountryRegistry.resolveCanonicalId(item.code || item.id);

    const profile = CountryRegistry.getCountry(cleanId);
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
      branchTech: MilitaryInventoryHelper.initializeBranchTech(techLevel),
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
      id: cleanId,
      name: item.nameFa,
      isAi: !isHuman,
      isAlive: true,
      flagCode: item.flagCode,
      taxRate: 15,
      tariffRate: 15,
      treasury: item.startingTreasury,
      nationalDebt: 0,
      industrialLevel: item.industrialLevel,
      government: {
        type: govType,
        stability: item.startingStability ?? 50,
        turnsInPower: 5,
      },
      military: baseMilitary,
      recruitmentQueue: [],
      relations: {},
      activeModifiers: [],
      globalReputation: 50,
      executedEspionageTiers: [],
      warFocusTargetId: null,
      postWarCooldownTurns: 0,
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
      (m) => CountryRegistry.resolveCanonicalId(m.code || m.id) === canonicalId,
    );

    if (found) {
      return this.buildNationFromManifest(found, isHuman, customGovType);
    }

    const profile = CountryRegistry.getCountry(canonicalId);
    const fallback = CountryDefaultsUtility.getFallbackProfile(
      canonicalId,
      profile,
    );
    const tierStack = MilitaryDistributionEngine.calculateStartingStack(
      fallback.militaryTier,
      true,
      fallback.startingTechLevel,
    );

    const fallbackManifestItem: FinalManifestNation = {
      id: canonicalId,
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
      startingStability: 50,
    };

    return this.buildNationFromManifest(
      fallbackManifestItem,
      isHuman,
      customGovType,
    );
  }
}
