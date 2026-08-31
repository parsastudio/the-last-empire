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
    const domesticTech = item.startingTechLevel ?? 1.0;
    const equipmentTech = item.equipmentTechLevel ?? domesticTech;

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

    const initialNavalFleet = item.hasSeaAccess && domesticTech > 4.5 ? 3 : 0;

    const doctrineProfile = NationDoctrineResolver.resolveProfileForCountry(
      cleanId,
      domesticTech,
      equipmentTech,
      item.gdp,
    );

    const industrialLevel = item.industrialLevel ?? domesticTech;
    const initialFactoryCount =
      IndustryCalculator.calculateStartingTotalFactories(
        item.gdp,
        equipmentTech,
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
      equipmentTechLevel: equipmentTech,
      factoryTiers: [{ techLevel: equipmentTech, count: initialFactoryCount }],
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
      warFocusTargetId: null,
      postWarCooldownTurns: 0,
      doctrine: item.aiDoctrine || doctrineProfile.type,
      doctrineWeights: doctrineProfile.weights,
      securityGuarantorId: null,
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
