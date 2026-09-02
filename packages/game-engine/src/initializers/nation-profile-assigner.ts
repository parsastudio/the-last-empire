import {
  Nation,
  CountryRegistry,
  FinalManifestNation,
  MilitaryInventoryHelper,
  MilitaryStack,
  NationDoctrineResolver,
  MilitaryDistributionEngine,
  IndustryCalculator,
} from "@geopolitics/domain";

type GovernmentType = Nation["government"]["type"];

export class NationProfileAssigner {
  public buildNationFromManifest(
    item: FinalManifestNation,
    isHuman: boolean,
    customGovType?: GovernmentType | string,
  ): Nation {
    const validGovTypes: GovernmentType[] = [
      "PLURALIST_PARLIAMENTARY",
      "CENTRALIZED_PRESIDENTIAL",
      "IDEOLOGICAL_REGIME",
      "HEREDITARY_MONARCHY",
      "TECHNOCRATIC_ONE_PARTY",
    ];

    let govType: GovernmentType =
      (item.defaultGovernment as GovernmentType) ?? "PLURALIST_PARLIAMENTARY";
    if (
      customGovType &&
      validGovTypes.includes(customGovType as GovernmentType)
    ) {
      govType = customGovType as GovernmentType;
    }

    const cleanId = CountryRegistry.resolveCanonicalId(item.code || item.id);
    const domesticMilitaryTech = item.startingTechLevel ?? 1.0;
    const militaryEquipmentTech =
      item.equipmentTechLevel ?? domesticMilitaryTech;
    const industrialLevel = item.industrialLevel ?? 1.0;

    const dynamicStack = MilitaryDistributionEngine.calculateStartingStack(
      item.gdp,
      domesticMilitaryTech,
      militaryEquipmentTech,
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
      techLevel: domesticMilitaryTech,
      branchTech:
        dynamicStack.branchTech ||
        MilitaryInventoryHelper.initializeBranchTech(domesticMilitaryTech),
    };

    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "INFANTRY",
      infantry,
      dynamicStack.branchTech?.infantry ?? domesticMilitaryTech,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "ARMOR",
      armor,
      dynamicStack.branchTech?.armor ?? domesticMilitaryTech,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "AIR_DEFENSE",
      airDefense,
      dynamicStack.branchTech?.airDefense ?? domesticMilitaryTech,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "AIR_FORCE",
      airForce,
      dynamicStack.branchTech?.airForce ?? domesticMilitaryTech,
    );
    baseMilitary = MilitaryInventoryHelper.addUnits(
      baseMilitary,
      "DRONE_MISSILE",
      droneMissile,
      dynamicStack.branchTech?.droneMissile ?? domesticMilitaryTech,
    );

    const initialNavalFleet =
      item.hasSeaAccess && domesticMilitaryTech > 4.5 ? 3 : 0;

    const doctrineProfile = NationDoctrineResolver.resolveProfileForCountry(
      cleanId,
      domesticMilitaryTech,
      militaryEquipmentTech,
      item.gdp,
    );

    const initialFactoryCount =
      IndustryCalculator.calculateStartingTotalFactories(
        item.gdp,
        industrialLevel,
      );

    return {
      id: cleanId,
      name: item.nameFa,
      isAi: !isHuman,
      isAlive: true,
      flagCode: item.flagCode,
      economicStance: "BALANCED_MIXED",
      treasury: item.startingTreasury,
      nationalDebt: 0,
      industrialLevel,
      equipmentTechLevel: industrialLevel,
      factoryTiers: [
        { techLevel: industrialLevel, count: initialFactoryCount },
      ],
      navalFleet: initialNavalFleet,
      government: {
        type: govType,
        stability: item.startingStability ?? 50,
        turnsInPower: 5,
      },
      military: baseMilitary,
      relations: {},
      activeModifiers: [],
      globalReputation: 50,
      executedEspionageTiers: [],
      attackedTargetIdsThisTurn: [],
      sentAidTargetIdsThisTurn: [],
      hasBoughtProvinceThisTurn: false,
      warFocusTargetId: null,
      postWarCooldownTurns: 0,
      doctrine: item.aiDoctrine || doctrineProfile.type,
      doctrineWeights: doctrineProfile.weights,
      securityGuarantorId: null,
      isEmergencyProtectorate: false,
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

    if (!found) {
      throw new Error(`کشور ${id} در مانیفست استراتژیک نقشه تعریف نشده است.`);
    }

    return this.buildNationFromManifest(found, isHuman, customGovType);
  }
}
