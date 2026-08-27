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
    const domesticTech =
      profile?.domesticTechLevel ??
      profile?.startingTechLevel ??
      item.startingTechLevel ??
      1.0;
    const equipmentTech = profile?.equipmentTechLevel ?? domesticTech;

    const dynamicStack = MilitaryDistributionEngine.calculateStartingStack(
      item.gdp,
      domesticTech,
      equipmentTech,
    );

    const infantry =
      item.startingInfantry > 0 ? item.startingInfantry : dynamicStack.infantry;
    const armor =
      item.startingArmor !== undefined && item.startingArmor > 0
        ? item.startingArmor
        : dynamicStack.armor;
    const airDefense =
      item.startingAirDefense !== undefined && item.startingAirDefense > 0
        ? item.startingAirDefense
        : dynamicStack.airDefense;
    const airForce =
      item.startingAirForce > 0 ? item.startingAirForce : dynamicStack.airForce;
    const droneMissile =
      item.startingDroneMissile > 0
        ? item.startingDroneMissile
        : dynamicStack.droneMissile;

    let baseMilitary: MilitaryStack = {
      infantry: 0,
      armor: 0,
      airDefense: 0,
      airForce: 0,
      droneMissile: 0,
      experience: 10,
      techLevel: domesticTech,
      branchTech:
        dynamicStack.branchTech ||
        MilitaryInventoryHelper.initializeBranchTech(domesticTech),
    };

    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "INFANTRY",
      infantry,
      dynamicStack.branchTech?.infantry ?? domesticTech,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "ARMOR",
      armor,
      dynamicStack.branchTech?.armor ?? domesticTech,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "AIR_DEFENSE",
      airDefense,
      dynamicStack.branchTech?.airDefense ?? domesticTech,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "AIR_FORCE",
      airForce,
      dynamicStack.branchTech?.airForce ?? domesticTech,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "DRONE_MISSILE",
      droneMissile,
      dynamicStack.branchTech?.droneMissile ?? domesticTech,
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
    const dynamicStack = MilitaryDistributionEngine.calculateStartingStack(
      fallback.gdp,
      fallback.domesticTechLevel,
      fallback.equipmentTechLevel,
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
      startingInfantry: dynamicStack.infantry,
      startingArmor: dynamicStack.armor,
      startingAirDefense: dynamicStack.airDefense,
      startingAirForce: dynamicStack.airForce,
      startingDroneMissile: dynamicStack.droneMissile,
      startingTechLevel: dynamicStack.techLevel,
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
