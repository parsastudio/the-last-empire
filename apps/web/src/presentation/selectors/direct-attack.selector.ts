import {
  Nation,
  ProvinceDynamicState,
  GameState,
  DiplomaticStance,
  CountryRegistry,
  LandNeighborResolver,
  NationGettersUtility,
  NationRelationResolver,
  getNationGdp,
  MILITARY_UNIT_STATS,
  NationTurnActivity,
  MapTopologyRegistry,
} from "@geopolitics/domain";
import {
  BattleCalculator,
  CombatModifierResolver,
  NavalDeploymentClamper,
  EspionageCalculator,
} from "@geopolitics/game-engine";
import { TacticalForecast } from "@/presentation/components/tactical-map/modals/attack/attack-intel-panel";

export interface DirectAttackReachEvaluation {
  targetProvince: ProvinceDynamicState | null;
  isLandNeighbor: boolean;
  isNavalValid: boolean;
  attackType: "LAND" | "NAVAL";
  originRegionName: string;
  targetRegionName: string;
}

export interface DirectAttackPenaltyEvaluation {
  currentStance: DiplomaticStance;
  isWarStance: boolean;
  reputationPenalty: number;
}

export interface DirectAttackGuarantorsEvaluation {
  activeGuarantorNames: string[];
  mutualGuarantorNames: string[];
  partnerGuarantorNames: string[];
}

export interface DirectAttackLogisticsEvaluation {
  totalForceCost: number;
  totalLogisticsCost: number;
  navalFleetCount: number;
  hasNavalCapacity: boolean;
  canAfford: boolean;
  hasSelectedInfantry: boolean;
}

export interface DirectAttackReconEvaluation {
  isReconActive: boolean;
  reconCost: number;
  canAffordRecon: boolean;
}

export class DirectAttackSelector {
  public static selectReach(
    humanNation: Nation | null,
    targetNation: Nation | null,
    targetProvinceId: number | null,
    gameState: GameState | null,
  ): DirectAttackReachEvaluation {
    const targetProvince =
      gameState && targetProvinceId
        ? gameState.provinces[targetProvinceId.toString()] || null
        : null;

    const isLandNeighbor =
      humanNation && targetProvinceId && gameState
        ? LandNeighborResolver.hasProvinceLandBorder(
            targetProvinceId,
            humanNation.id,
            gameState.provinces,
          )
        : false;

    const attackerHasSea =
      humanNation && gameState
        ? NationGettersUtility.hasSeaAccess(humanNation.id, gameState.provinces)
        : false;

    const targetProvinceHasSea = targetProvince
      ? MapTopologyRegistry.hasSeaAccess(targetProvince.provinceId, false)
      : false;

    const isNavalValid =
      !isLandNeighbor && attackerHasSea && targetProvinceHasSea;
    const attackType: "LAND" | "NAVAL" = isLandNeighbor ? "LAND" : "NAVAL";

    const originRegionName = humanNation
      ? `خاک ${humanNation.name}`
      : "خاک اصلی کشور";

    let targetRegionName = "";
    if (targetProvince) {
      targetRegionName = MapTopologyRegistry.getNameFa(
        targetProvince.provinceId,
        "",
      );
    } else if (targetNation) {
      targetRegionName = `خاک اصلی ${targetNation.name}`;
    }

    return {
      targetProvince,
      isLandNeighbor,
      isNavalValid,
      attackType,
      originRegionName,
      targetRegionName,
    };
  }

  public static selectPenalty(
    humanNation: Nation | null,
    targetNation: Nation | null,
  ): DirectAttackPenaltyEvaluation {
    if (!humanNation || !targetNation) {
      return {
        currentStance: "NORMAL_DIPLOMACY",
        isWarStance: false,
        reputationPenalty: 15,
      };
    }

    const currentStance = NationRelationResolver.getStance(
      humanNation.relations,
      targetNation.id,
    );
    const isWarStance = currentStance === "WAR";

    let reputationPenalty = 15;
    if (isWarStance) {
      reputationPenalty = 0;
    } else if (currentStance === "STRATEGIC_PARTNERSHIP") {
      reputationPenalty = 40;
    } else if (currentStance === "NON_AGGRESSION_PACT") {
      reputationPenalty = 25;
    }

    return {
      currentStance,
      isWarStance,
      reputationPenalty,
    };
  }

  public static selectGuarantors(
    humanNation: Nation | null,
    targetNation: Nation | null,
    gameState: GameState | null,
    isWarStance: boolean,
  ): DirectAttackGuarantorsEvaluation {
    if (!targetNation || !gameState || !humanNation || isWarStance) {
      return {
        activeGuarantorNames: [],
        mutualGuarantorNames: [],
        partnerGuarantorNames: [],
      };
    }

    const relWithHuman = humanNation.relations?.[targetNation.id];
    if (relWithHuman?.isIntervener) {
      return {
        activeGuarantorNames: [],
        mutualGuarantorNames: [],
        partnerGuarantorNames: [],
      };
    }

    const activeGuarantorNames: string[] = [];
    const mutualGuarantorNames: string[] = [];
    const partnerGuarantorNames: string[] = [];

    const targetGuarantors = targetNation.defenseGuarantorIds || [];
    const humanGuarantors = humanNation.defenseGuarantorIds || [];

    for (let i = 0; i < targetGuarantors.length; i++) {
      const gId = targetGuarantors[i]!;
      const canonicalG = CountryRegistry.resolveCanonicalId(gId);
      const gNation = gameState.nations[canonicalG];

      if (!gNation || !gNation.isAlive) continue;

      const isMutual = humanGuarantors.some(
        (hId) => CountryRegistry.resolveCanonicalId(hId) === canonicalG,
      );

      if (isMutual) {
        mutualGuarantorNames.push(gNation.name);
        continue;
      }

      const rel =
        gNation.relations?.[humanNation.id] ||
        humanNation.relations?.[canonicalG];

      if (rel?.stance === "STRATEGIC_PARTNERSHIP") {
        partnerGuarantorNames.push(gNation.name);
        continue;
      }

      activeGuarantorNames.push(gNation.name);
    }

    return {
      activeGuarantorNames,
      mutualGuarantorNames,
      partnerGuarantorNames,
    };
  }

  public static selectLogistics(
    humanNation: Nation | null,
    infantry: number,
    armor: number,
    airForce: number,
    drones: number,
    attackType: "LAND" | "NAVAL",
  ): DirectAttackLogisticsEvaluation {
    const totalForceCost =
      infantry * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      armor * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      airForce * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      drones * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost;

    const { moneyCost: totalLogisticsCost } =
      CombatModifierResolver.calculateDeploymentCosts(totalForceCost);

    const navalFleetCount = humanNation?.navalFleet || 0;

    let hasNavalCapacity = true;
    if (attackType === "NAVAL") {
      const maxCapacity = NavalDeploymentClamper.calculateMaxCapacity(
        "NAVAL",
        navalFleetCount,
      );
      const reqCapacity = NavalDeploymentClamper.calculateRequiredCapacity(
        infantry,
        armor,
      );
      hasNavalCapacity = navalFleetCount > 0 && reqCapacity <= maxCapacity;
    }

    const currentTreasury = humanNation?.treasury || 0;
    const canAfford = currentTreasury >= totalLogisticsCost;
    const hasSelectedInfantry = infantry > 0;

    return {
      totalForceCost,
      totalLogisticsCost,
      navalFleetCount,
      hasNavalCapacity,
      canAfford,
      hasSelectedInfantry,
    };
  }

  public static selectRecon(
    humanNation: Nation | null,
    targetNation: Nation | null,
    provincesMap?: Record<string, ProvinceDynamicState>,
    turnActivity?: NationTurnActivity,
  ): DirectAttackReconEvaluation {
    if (!humanNation || !targetNation) {
      return {
        isReconActive: false,
        reconCost: 0,
        canAffordRecon: false,
      };
    }

    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetNation.id);
    const executedList = turnActivity?.executedEspionageTiers ?? [];
    const isReconActive = executedList.includes(`${canonicalTarget}:1`);

    const targetGdp = getNationGdp(targetNation, provincesMap);
    const reconCost = EspionageCalculator.calculateOperationCost(targetGdp, 1);
    const canAffordRecon = humanNation.treasury >= reconCost;

    return {
      isReconActive,
      reconCost,
      canAffordRecon,
    };
  }

  public static selectForecast(
    humanNation: Nation | null,
    targetNation: Nation | null,
    targetGuarantorNation: Nation | null,
    drones: number,
    infantry: number,
    armor: number,
    airForce: number,
    provincesMap?: Record<string, ProvinceDynamicState>,
    targetProvinceId?: number,
  ): TacticalForecast {
    if (!humanNation || !targetNation) {
      return {
        winProbability: 0,
        isVictoryPredicted: false,
        isCapitulationPredicted: false,
        phase1Prediction: "نامشخص",
        phase2Prediction: "نامشخص",
        phase3Prediction: "نامشخص",
        valuationRatio: 1,
      };
    }

    const calcResult = BattleCalculator.calculateBattle(
      humanNation,
      targetNation,
      drones,
      infantry,
      armor,
      airForce,
      provincesMap,
      targetGuarantorNation,
      targetProvinceId,
    );

    const isVictoryPredicted = calcResult.isAttackerVictory;
    const winProbability = isVictoryPredicted ? 100 : 0;
    const isCapitulationPredicted = calcResult.valuationRatio >= 3.0;

    let phase1Prediction = "عملیات پرتاب موشک انجام نشد";
    if (drones > 0) {
      phase1Prediction =
        calcResult.phase1Missile.phaseWinner === "ATTACKER"
          ? "نفوذ موفق موشک‌ها و تضعیف پدافند"
          : "رهگیری موشک‌ها توسط سامانه پدافند";
    }

    let phase2Prediction = "توازن قوای هوایی";
    if (calcResult.phase2Air.phaseWinner === "ATTACKER") {
      phase2Prediction = "برتری کامل شکاری‌های خودی";
    } else if (calcResult.phase2Air.phaseWinner === "DEFENDER") {
      phase2Prediction = "پدافند هوایی موثر مدافع";
    }

    let phase3Prediction = "ریسک بالای شکست سنگرها";
    if (calcResult.phase3Ground.phaseWinner === "ATTACKER") {
      phase3Prediction = "شکست قطعی خطوط زمینی دشمن";
    }

    return {
      winProbability,
      isVictoryPredicted,
      isCapitulationPredicted,
      phase1Prediction,
      phase2Prediction,
      phase3Prediction,
      valuationRatio: calcResult.valuationRatio,
      phase2Air: calcResult.phase2Air,
      auxiliaryGuarantor: calcResult.auxiliaryGuarantor,
    };
  }
}
