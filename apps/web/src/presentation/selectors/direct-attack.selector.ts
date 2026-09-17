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
  NationTurnActivity,
  MapTopologyRegistry,
  MilitaryPricingCalculator,
  GameStateMetricsUtility,
} from "@geopolitics/domain";
import {
  BattleCalculator,
  CombatModifierResolver,
  NavalDeploymentClamper,
  EspionageCalculator,
} from "@geopolitics/game-engine";
import { TacticalForecast } from "@/presentation/components/tactical-map/modals/attack/attack-intel-panel";

export interface DirectAttackReachEvaluation {
  targetProvinceId: number | null;
  isLandNeighbor: boolean;
  isNavalValid: boolean;
  attackType: "LAND" | "NAVAL";
}

export interface DirectAttackPenaltyEvaluation {
  currentStance: DiplomaticStance;
  isWarStance: boolean;
  reputationPenalty: number;
}

export interface DirectAttackGuarantorIdsEvaluation {
  activeGuarantorIds: string[];
  mutualGuarantorIds: string[];
  partnerGuarantorIds: string[];
}

export interface DirectAttackLogisticsEvaluation {
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
    targetProvinceId: number | null,
    gameState: GameState | null,
    targetNationId?: string | null,
  ): DirectAttackReachEvaluation {
    if (!humanNation || !gameState) {
      return {
        targetProvinceId: null,
        isLandNeighbor: false,
        isNavalValid: false,
        attackType: "LAND",
      };
    }

    const canonicalTargetNation = targetNationId
      ? CountryRegistry.resolveCanonicalId(targetNationId)
      : null;

    let effectiveProvinceId = targetProvinceId;

    let isLandNeighbor = false;
    if (effectiveProvinceId) {
      isLandNeighbor = LandNeighborResolver.hasProvinceLandBorder(
        effectiveProvinceId,
        humanNation.id,
        gameState.provinces,
      );
    }

    if (!isLandNeighbor && canonicalTargetNation && gameState.provinces) {
      const ownedProvinces = Object.values(gameState.provinces).filter(
        (p) =>
          CountryRegistry.resolveCanonicalId(p.ownerNationId) ===
          canonicalTargetNation,
      );

      for (let i = 0; i < ownedProvinces.length; i++) {
        const p = ownedProvinces[i]!;
        if (
          LandNeighborResolver.hasProvinceLandBorder(
            p.provinceId,
            humanNation.id,
            gameState.provinces,
          )
        ) {
          effectiveProvinceId = p.provinceId;
          isLandNeighbor = true;
          break;
        }
      }
    }

    const attackerHasSea = NationGettersUtility.hasSeaAccess(
      humanNation.id,
      gameState.provinces,
    );

    let targetProvinceHasSea = false;
    if (effectiveProvinceId) {
      targetProvinceHasSea = MapTopologyRegistry.hasSeaAccess(
        effectiveProvinceId,
        false,
      );
    }

    if (
      !isLandNeighbor &&
      !targetProvinceHasSea &&
      canonicalTargetNation &&
      attackerHasSea &&
      gameState.provinces
    ) {
      const ownedProvinces = Object.values(gameState.provinces).filter(
        (p) =>
          CountryRegistry.resolveCanonicalId(p.ownerNationId) ===
          canonicalTargetNation,
      );

      for (let i = 0; i < ownedProvinces.length; i++) {
        const p = ownedProvinces[i]!;
        if (MapTopologyRegistry.hasSeaAccess(p.provinceId, false)) {
          effectiveProvinceId = p.provinceId;
          targetProvinceHasSea = true;
          break;
        }
      }
    }

    const isNavalValid =
      !isLandNeighbor && attackerHasSea && targetProvinceHasSea;
    const attackType: "LAND" | "NAVAL" = isLandNeighbor ? "LAND" : "NAVAL";

    return {
      targetProvinceId: effectiveProvinceId,
      isLandNeighbor,
      isNavalValid,
      attackType,
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
  ): DirectAttackGuarantorIdsEvaluation {
    if (!targetNation || !gameState || !humanNation || isWarStance) {
      return {
        activeGuarantorIds: [],
        mutualGuarantorIds: [],
        partnerGuarantorIds: [],
      };
    }

    const relWithHuman = humanNation.relations?.[targetNation.id];
    if (relWithHuman?.isIntervener) {
      return {
        activeGuarantorIds: [],
        mutualGuarantorIds: [],
        partnerGuarantorIds: [],
      };
    }

    const activeGuarantorIds: string[] = [];
    const mutualGuarantorIds: string[] = [];
    const partnerGuarantorIds: string[] = [];

    const targetGuarantors = targetNation.defenseGuarantorIds || [];
    const humanGuarantors = humanNation.defenseGuarantorIds || [];

    for (let i = 0; i < targetGuarantors.length; i++) {
      const gId = targetGuarantors[i]!;
      const canonicalG = CountryRegistry.resolveCanonicalId(gId);
      const gNation = NationGettersUtility.resolveNation(
        canonicalG,
        gameState.nations,
      );

      if (!gNation || !gNation.isAlive) continue;

      const isMutual = humanGuarantors.some((hId) =>
        GameStateMetricsUtility.isHumanNation(canonicalG, hId),
      );

      if (isMutual) {
        mutualGuarantorIds.push(canonicalG);
        continue;
      }

      const rel =
        gNation.relations?.[humanNation.id] ||
        humanNation.relations?.[canonicalG];

      if (rel?.stance === "STRATEGIC_PARTNERSHIP") {
        partnerGuarantorIds.push(canonicalG);
        continue;
      }

      activeGuarantorIds.push(canonicalG);
    }

    return {
      activeGuarantorIds,
      mutualGuarantorIds,
      partnerGuarantorIds,
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
      MilitaryPricingCalculator.calculateTotalArmyValuation({
        infantry,
        armor,
        airForce,
        droneMissile: drones,
      });

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
  ): TacticalForecast {
    if (!humanNation || !targetNation) {
      return {
        winProbability: 0,
        isVictoryPredicted: false,
        isCapitulationPredicted: false,
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
    );

    const isVictoryPredicted = calcResult.isAttackerVictory;
    const winProbability = isVictoryPredicted ? 100 : 0;
    const isCapitulationPredicted = calcResult.valuationRatio >= 3.0;

    return {
      winProbability,
      isVictoryPredicted,
      isCapitulationPredicted,
      auxiliaryGuarantor: calcResult.auxiliaryGuarantor,
    };
  }
}
