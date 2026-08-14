import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { BattleDiplomacyHelper } from "@/engine/combat/battle-diplomacy-helper";
import { GdpCalculator } from "@/engine/economy/calculators/gdp-calculator";
import { RankManager } from "@/engine/politics/rank-manager";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";
import { AllianceInterventionEvaluator } from "@/engine/combat/alliance-intervention-evaluator";
import { ProvinceConquestHandler } from "@/engine/combat/conquest/province-conquest-handler";
import { DemographicsTransferCalculator } from "@/engine/combat/conquest/demographics-transfer-calculator";
import { BattleLootManager } from "@/engine/combat/loot/battle-loot-manager";

export class BattleExecutionEngine {
  public executeBattle(
    state: GameState,
    action: InitiateBattleAction,
  ): GameState {
    const canonicalAttackerId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const canonicalDefenderId = CountryRegistry.resolveCanonicalId(
      action.targetNationId,
    );

    const attacker =
      state.nations[action.nationId] || state.nations[canonicalAttackerId];
    const defender =
      state.nations[action.targetNationId] ||
      state.nations[canonicalDefenderId];

    if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
      return state;
    }

    const currentStance = NationRelationResolver.getStance(
      attacker.relations,
      defender.id,
    );
    const betrayalResult =
      BattleDiplomacyHelper.evaluateBetrayalPenalty(currentStance);

    let navalCostMultiplier: number | undefined = undefined;
    if (action.attackType === "NAVAL" && action.targetProvinceId) {
      const navalInfo = NavalNeighborResolver.resolveNavalAttack(
        action.targetProvinceId,
        attacker.id,
        state.provinces,
        action.infantryToDeploy || attacker.military.infantry,
        action.armorToDeploy || attacker.military.armor || 0,
        action.airForceToDeploy || attacker.military.airForce,
        action.dronesToLaunch,
      );
      if (navalInfo.isNavalValid) {
        navalCostMultiplier = navalInfo.navalCostMultiplier;
      }
    }

    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch,
      action.infantryToDeploy,
      action.armorToDeploy || 0,
      action.airForceToDeploy,
      action.attackType,
      navalCostMultiplier,
    );

    const conquest = ProvinceConquestHandler.handleConquest(
      state.provinces,
      attacker.id,
      canonicalAttackerId,
      defender.id,
      canonicalDefenderId,
      calcResult.isAttackerVictory,
      calcResult.isFullCapitulation,
      action.targetProvinceId,
      defender.geography.territoryPixelCount || 1,
    );

    const isDefenderAlive =
      conquest.remainingDefenderProvinces.length > 0 &&
      !calcResult.isFullCapitulation;

    const transfer = DemographicsTransferCalculator.calculateTransfer(
      defender,
      calcResult.isAttackerVictory,
      calcResult.isFullCapitulation,
      conquest.conqueredPixels,
      conquest.defenderTotalPixels,
    );

    const attackerTotalPixels = conquest.attackerProvinces.reduce(
      (sum, p) => sum + p.pixelCount,
      0,
    );
    const attackerProvIds = conquest.attackerProvinces.map((p) => p.provinceId);
    const defenderRemainingPixels = conquest.remainingDefenderProvinces.reduce(
      (sum, p) => sum + p.pixelCount,
      0,
    );
    const defenderProvIds = conquest.remainingDefenderProvinces.map(
      (p) => p.provinceId,
    );

    const updatedAttackerMilitary =
      BattleLootManager.applyAttackerForcesAndSpoils(
        attacker.military,
        defender.military.techLevel,
        calcResult,
      );

    const newAttackerMaxCap =
      (attacker.maxPopulationCapacity ||
        Math.floor(attacker.population / 0.95)) + transfer.transferredCapacity;

    let updatedAttacker = GdpCalculator.syncNationGdpAndDemographics(
      {
        ...attacker,
        maxPopulationCapacity: newAttackerMaxCap,
        geography: {
          ...attacker.geography,
          territoryPixelCount: attackerTotalPixels,
        },
      },
      attacker.population + transfer.transferredPopulation,
    );

    let baseWarRepPenalty = currentStance !== "WAR" ? 10 : 0;
    if (calcResult.isFullCapitulation) {
      baseWarRepPenalty += 15;
    }
    const totalRepPenalty =
      baseWarRepPenalty +
      (betrayalResult.hasBetrayed ? betrayalResult.reputationPenalty : 0);

    updatedAttacker = {
      ...updatedAttacker,
      globalReputation: Math.max(
        -100,
        attacker.globalReputation - totalRepPenalty,
      ),
      provinceIds: attackerProvIds,
      treasury:
        attacker.treasury -
        calcResult.deploymentMoneyCost +
        calcResult.treasuryLooted,
      military: updatedAttackerMilitary,
    };

    const attackerRelKey = updatedAttacker.relations[defender.id]
      ? defender.id
      : canonicalDefenderId;
    if (updatedAttacker.relations[attackerRelKey]) {
      updatedAttacker.relations = {
        ...updatedAttacker.relations,
        [attackerRelKey]: {
          ...updatedAttacker.relations[attackerRelKey]!,
          stance: "WAR",
          isTradeEmbargoed: true,
          opinion: -100,
        },
      };
    }

    const newDefenderPop = isDefenderAlive
      ? Math.max(0, defender.population - transfer.transferredPopulation)
      : 0;
    const newDefenderCap = isDefenderAlive
      ? Math.max(
          0,
          (defender.maxPopulationCapacity ||
            Math.floor(defender.population / 0.95)) -
            transfer.transferredCapacity,
        )
      : 0;

    const updatedDefenderMilitary = BattleLootManager.applyDefenderCasualties(
      defender.military,
      calcResult,
      isDefenderAlive,
    );

    let updatedDefender = GdpCalculator.syncNationGdpAndDemographics(
      {
        ...defender,
        maxPopulationCapacity: newDefenderCap,
        geography: {
          ...defender.geography,
          territoryPixelCount: defenderRemainingPixels,
        },
      },
      newDefenderPop,
    );

    updatedDefender = {
      ...updatedDefender,
      isAlive: isDefenderAlive,
      provinceIds: defenderProvIds,
      treasury: isDefenderAlive
        ? Math.max(0, defender.treasury - calcResult.treasuryLooted)
        : 0,
      military: updatedDefenderMilitary,
    };

    const defenderRelKey = updatedDefender.relations[attacker.id]
      ? attacker.id
      : canonicalAttackerId;
    if (updatedDefender.relations[defenderRelKey]) {
      updatedDefender.relations = {
        ...updatedDefender.relations,
        [defenderRelKey]: {
          ...updatedDefender.relations[defenderRelKey]!,
          stance: "WAR",
          isTradeEmbargoed: true,
          opinion: -100,
        },
      };
    }

    const baseNations = {
      ...state.nations,
      [attacker.id]: updatedAttacker,
      [defender.id]: updatedDefender,
    };

    const intervention =
      AllianceInterventionEvaluator.evaluateAllianceInterventions(
        updatedAttacker,
        updatedDefender,
        baseNations,
      );

    const betrayalText = betrayalResult.hasBetrayed
      ? ` [جریمه نقض معاهده: -${betrayalResult.reputationPenalty} اعتبار جهانی]`
      : "";

    const { logEntry } = BattleDiplomacyHelper.buildBattleReportAndLog(
      state,
      updatedAttacker,
      updatedDefender,
      calcResult,
      calcResult.isFullCapitulation,
      betrayalText,
    );

    const additionalLogs: TurnLogEntry[] = [];
    for (const allyId of intervention.interveningAllyIds) {
      const ally = intervention.updatedNations[allyId];
      if (ally) {
        additionalLogs.push({
          id: `log-ally-war-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          turn: state.currentTurn,
          timestamp: Date.now(),
          sourceNationId: ally.id,
          level: "CRITICAL",
          message: `دفاع جمعی متحدین: کشور ${ally.name} در راستای اجرای تعهدات اتحاد نظامی با ${defender.name}، به ارتش ${attacker.name} اعلان جنگ رسمی نمود.`,
        });
      }
    }

    for (const allyId of intervention.dishonoringAllyIds) {
      const ally = intervention.updatedNations[allyId];
      if (ally) {
        additionalLogs.push({
          id: `log-ally-dishonor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          turn: state.currentTurn,
          timestamp: Date.now(),
          sourceNationId: ally.id,
          level: "WARNING",
          message: `پیمان‌شکنی دفاعی: کشور ${ally.name} از ترس رویارویی با ارتش ${attacker.name}، اتحاد خود با ${defender.name} را لغو کرد و بی‌طرف ماند.`,
        });
      }
    }

    const rankedNations = RankManager.recalculateRanks(
      intervention.updatedNations,
    );

    const newState: GameState = {
      ...state,
      provinces: conquest.updatedProvinces,
      nations: rankedNations,
      turnLogs: [...state.turnLogs, logEntry, ...additionalLogs],
    };

    if (newState.turnLogs.length > 200) {
      newState.turnLogs.splice(0, newState.turnLogs.length - 200);
    }

    return newState;
  }
}
