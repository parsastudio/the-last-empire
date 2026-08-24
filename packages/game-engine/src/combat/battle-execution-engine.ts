import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { DiplomaticBetrayalCalculator } from "@/engine/diplomacy/diplomacy-engine";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";
import { AllianceInterventionEvaluator } from "@/engine/combat/alliance-intervention-evaluator";
import { ProvinceConquestHandler } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleAttackerStateApplier } from "@/engine/combat/state-appliers/battle-attacker-state-applier";
import { BattleDefenderStateApplier } from "@/engine/combat/state-appliers/battle-defender-state-applier";
import { BattleLogFactory } from "@/engine/combat/logging/battle-log-factory";
import { NationGettersUtility } from "@geopolitics/domain";

export class BattleExecutionEngine {
  public executeBattle(
    state: GameState,
    action: InitiateBattleAction,
  ): GameState {
    const battleTotalStart = performance.now();
    const canonicalAttackerId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const canonicalDefenderId = CountryRegistry.resolveCanonicalId(
      action.targetNationId,
    );

    const attacker =
      state.nations[canonicalAttackerId] || state.nations[action.nationId];
    const defender =
      state.nations[canonicalDefenderId] ||
      state.nations[action.targetNationId];

    if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
      return state;
    }

    const currentStance = NationRelationResolver.getStance(
      attacker.relations,
      defender.id,
    );
    const betrayalResult =
      DiplomaticBetrayalCalculator.calculatePenalty(currentStance);

    let navalCostMultiplier: number | undefined = undefined;
    if (action.attackType === "NAVAL" && action.targetProvinceId) {
      const navalStart = performance.now();
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
      const navalDuration = (performance.now() - navalStart).toFixed(2);
      console.log(
        `[BATTLE_PERF] محاسبه ترابری و دسترسی دریایی: ${navalDuration}ms`,
      );
    }

    const calcStart = performance.now();
    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch,
      action.infantryToDeploy,
      action.armorToDeploy || 0,
      action.airForceToDeploy,
      action.attackType,
      navalCostMultiplier,
      state.provinces,
    );
    const calcDuration = (performance.now() - calcStart).toFixed(2);

    const defPixels =
      NationGettersUtility.getTerritoryPixelCount(
        defender.id,
        state.provinces,
      ) || 1;

    const conquestStart = performance.now();
    const conquest = ProvinceConquestHandler.handleConquest(
      state.provinces,
      attacker.id,
      canonicalAttackerId,
      defender.id,
      canonicalDefenderId,
      calcResult.isAttackerVictory,
      calcResult.isFullCapitulation,
      action.targetProvinceId,
      defPixels,
    );
    const conquestDuration = (performance.now() - conquestStart).toFixed(2);

    const isDefenderAlive =
      conquest.remainingDefenderProvinces.length > 0 &&
      !calcResult.isFullCapitulation;

    const applyStart = performance.now();
    const updatedAttacker = BattleAttackerStateApplier.apply({
      attacker,
      defenderId: defender.id,
      canonicalDefenderId,
      defenderTechLevel: defender.military.techLevel,
      calcResult,
      conquest,
      currentStance,
      betrayalResult,
    });

    const updatedDefender = BattleDefenderStateApplier.apply({
      defender,
      attackerId: attacker.id,
      canonicalAttackerId,
      calcResult,
      conquest,
      isDefenderAlive,
    });
    const applyDuration = (performance.now() - applyStart).toFixed(2);

    const baseNations = {
      ...state.nations,
      [attacker.id]: updatedAttacker,
      [defender.id]: updatedDefender,
    };

    const intervStart = performance.now();
    const intervention =
      AllianceInterventionEvaluator.evaluateAllianceInterventions(
        updatedAttacker,
        updatedDefender,
        baseNations,
      );
    const intervDuration = (performance.now() - intervStart).toFixed(2);

    const betrayalText = betrayalResult.hasBetrayed ? "BETRAYAL" : "";

    const battleLogs = BattleLogFactory.createBattleLogs(
      state.currentTurn,
      updatedAttacker,
      updatedDefender,
      calcResult,
      betrayalText,
      state.humanNationId,
    );

    const interventionLogs = BattleLogFactory.createInterventionLogs(
      state.currentTurn,
      intervention,
      updatedAttacker,
      updatedDefender,
      state.humanNationId,
    );

    const updatedLogs = [...state.turnLogs, ...battleLogs, ...interventionLogs];
    const totalBattleDuration = (performance.now() - battleTotalStart).toFixed(
      2,
    );

    console.log(
      `[BATTLE_EXECUTION] نبرد ${attacker.name} ➔ ${defender.name} | زمان کل: ${totalBattleDuration}ms [محاسبه فازها: ${calcDuration}ms | فتح استان: ${conquestDuration}ms | اعمال نتایج: ${applyDuration}ms | مداخله ائتلاف: ${intervDuration}ms]`,
    );

    return {
      ...state,
      provinces: conquest.updatedProvinces,
      nations: intervention.updatedNations,
      turnLogs: updatedLogs,
    };
  }
}
