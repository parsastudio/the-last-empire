import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { DiplomaticBetrayalCalculator } from "@/engine/diplomacy/diplomacy-engine";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { AllianceInterventionEvaluator } from "@/engine/combat/alliance-intervention-evaluator";
import { ProvinceConquestHandler } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleAttackerStateApplier } from "@/engine/combat/state-appliers/battle-attacker-state-applier";
import { BattleDefenderStateApplier } from "@/engine/combat/state-appliers/battle-defender-state-applier";
import { BattleLogFactory } from "@/engine/combat/logging/battle-log-factory";
import { ExtraCapturedMilitaryUnits } from "@/engine/combat/loot/battle-loot-manager";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import {
  BattleFullReportData,
  BattleSpoilsDetails,
} from "@/domain/reports/combat-report.schema";
import { AIEmergencyDefenseManager } from "@/engine/ai/ai-emergency-defense-manager";

export class BattleExecutionEngine {
  public executeBattle(
    state: GameState,
    action: InitiateBattleAction,
  ): { state: GameState; reportData: BattleFullReportData | null } {
    const canonicalAttackerId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const canonicalDefenderId = CountryRegistry.resolveCanonicalId(
      action.targetNationId,
    );

    let baseAttacker =
      state.nations[canonicalAttackerId] || state.nations[action.nationId];
    let baseDefender =
      state.nations[canonicalDefenderId] ||
      state.nations[action.targetNationId];

    if (
      !baseAttacker ||
      !baseDefender ||
      !baseAttacker.isAlive ||
      !baseDefender.isAlive
    ) {
      return { state, reportData: null };
    }

    let workingState = state;
    if (baseDefender.isAi) {
      const reactiveResult =
        AIEmergencyDefenseManager.handleReactiveDefenseProcurement(
          workingState,
          baseAttacker,
          baseDefender,
        );
      workingState = reactiveResult.newState;
    }

    const attacker =
      workingState.nations[canonicalAttackerId] ||
      workingState.nations[action.nationId]!;
    const defender =
      workingState.nations[canonicalDefenderId] ||
      workingState.nations[action.targetNationId]!;

    const currentStance = NationRelationResolver.getStance(
      attacker.relations,
      defender.id,
    );
    const betrayalResult =
      DiplomaticBetrayalCalculator.calculatePenalty(currentStance);

    const guarantorNation = defender.securityGuarantorId
      ? workingState.nations[
          CountryRegistry.resolveCanonicalId(defender.securityGuarantorId)
        ] ||
        workingState.nations[defender.securityGuarantorId] ||
        null
      : null;

    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch,
      action.infantryToDeploy,
      action.armorToDeploy || 0,
      action.airForceToDeploy,
      workingState.provinces,
      guarantorNation,
    );

    const conquest = ProvinceConquestHandler.handleConquest(
      workingState.provinces,
      attacker.id,
      defender.id,
      calcResult.isAttackerVictory,
      calcResult.isFullCapitulation,
      action.targetProvinceId,
    );

    const isDefenderAlive =
      conquest.remainingDefenderProvinces.length > 0 &&
      !calcResult.isFullCapitulation;

    const isTotalAnnexation = calcResult.isAttackerVictory && !isDefenderAlive;

    let extraCapturedUnits: ExtraCapturedMilitaryUnits | undefined = undefined;
    let extraTreasuryLooted = 0;

    if (isTotalAnnexation && !calcResult.isFullCapitulation) {
      const survivingDefenderInf = Math.max(
        0,
        (defender.military.infantry || 0) -
          calcResult.defenderCasualties.infantryLost,
      );
      const survivingDefenderArmor = Math.max(
        0,
        (defender.military.armor || 0) -
          calcResult.defenderCasualties.armorLost,
      );
      const survivingDefenderAD = Math.max(
        0,
        (defender.military.airDefense || 0) -
          calcResult.defenderCasualties.airDefenseLost,
      );
      const survivingDefenderAir = Math.max(
        0,
        (defender.military.airForce || 0) -
          calcResult.defenderCasualties.airForceLost,
      );
      const survivingDefenderDrones = Math.max(
        0,
        defender.military.droneMissile || 0,
      );

      extraCapturedUnits = {
        infantry: survivingDefenderInf,
        armor: survivingDefenderArmor,
        airDefense: survivingDefenderAD,
        airForce: survivingDefenderAir,
        droneMissile: survivingDefenderDrones,
      };

      extraTreasuryLooted = Math.max(
        0,
        defender.treasury - calcResult.treasuryLooted,
      );
    }

    const isCounterAttack =
      defender.warFocusTargetId === canonicalAttackerId ||
      defender.warFocusTargetId === attacker.id;

    const updatedAttacker = BattleAttackerStateApplier.apply({
      attacker,
      defenderId: defender.id,
      defenderTechLevel: defender.military.techLevel,
      calcResult,
      currentStance,
      betrayalResult,
      isDefenderEliminated: !isDefenderAlive,
      extraCapturedUnits,
      extraTreasuryLooted,
      isCounterAttack,
    });

    const updatedDefender = BattleDefenderStateApplier.apply({
      defender,
      attackerId: attacker.id,
      calcResult,
      conquest,
      isDefenderAlive,
    });

    const baseNations = {
      ...workingState.nations,
      [attacker.id]: updatedAttacker,
      [defender.id]: updatedDefender,
    };

    const intervention =
      AllianceInterventionEvaluator.evaluateAllianceInterventions(
        updatedAttacker,
        defender,
        baseNations,
        conquest.updatedProvinces,
      );

    const betrayalText = betrayalResult.hasBetrayed ? "BETRAYAL" : "";
    const targetProvinceObj = action.targetProvinceId
      ? workingState.provinces[action.targetProvinceId.toString()] || null
      : null;

    let gainedPop = 0;
    let gainedGdp = 0;
    for (let i = 0; i < conquest.conqueredProvincesList.length; i++) {
      const p = conquest.conqueredProvincesList[i]!;
      gainedPop += p.population || 0;
      gainedGdp += getProvinceGdp(p);
    }

    const totalLootedTreasury =
      calcResult.treasuryLooted + (extraTreasuryLooted || 0);

    const spoilsData: BattleSpoilsDetails = {
      conqueredPixels: conquest.conqueredPixels,
      conqueredProvincesCount: conquest.conqueredProvincesList.length,
      conqueredProvincesNames: conquest.conqueredProvincesList.map(
        (p) => p.nameFa,
      ),
      gainedPopulation: gainedPop,
      gainedGdp: gainedGdp,
      lootedTreasury: totalLootedTreasury,
      capturedInfantry:
        calcResult.capturedInfantry + (extraCapturedUnits?.infantry || 0),
      capturedArmor:
        calcResult.capturedArmor + (extraCapturedUnits?.armor || 0),
      capturedAirDefense:
        calcResult.capturedAirDefense + (extraCapturedUnits?.airDefense || 0),
      capturedAirForce:
        calcResult.capturedAirForce + (extraCapturedUnits?.airForce || 0),
      capturedDrones:
        calcResult.capturedDrones + (extraCapturedUnits?.droneMissile || 0),
    };

    const attackType = action.attackType || "LAND";

    const fullReportData: BattleFullReportData = {
      attackerId: attacker.id,
      defenderId: defender.id,
      targetProvinceName: targetProvinceObj?.nameFa,
      attackType,
      isAttackerVictory: calcResult.isAttackerVictory,
      isFullCapitulation: calcResult.isFullCapitulation || !isDefenderAlive,
      valuationRatio: calcResult.valuationRatio,
      treasuryLooted: calcResult.treasuryLooted,
      attackerCasualties: calcResult.attackerCasualties,
      defenderCasualties: calcResult.defenderCasualties,
      phase1Missile: calcResult.phase1Missile,
      phase2Air: calcResult.phase2Air,
      phase3Ground: calcResult.phase3Ground,
      spoils: spoilsData,
      auxiliaryGuarantor: calcResult.auxiliaryGuarantor,
    };

    const battleLogs = BattleLogFactory.createBattleLogs(
      workingState.currentTurn,
      updatedAttacker,
      updatedDefender,
      calcResult,
      betrayalText,
      workingState.humanNationId,
      !isDefenderAlive,
      targetProvinceObj,
      attackType,
      spoilsData,
    );

    const interventionLogs = BattleLogFactory.createInterventionLogs(
      workingState.currentTurn,
      intervention,
      updatedAttacker,
      updatedDefender,
      workingState.humanNationId,
    );

    const updatedLogs = [
      ...workingState.turnLogs,
      ...battleLogs,
      ...interventionLogs,
    ];

    if (conquest.conqueredProvincesList.length > 0) {
      BitPackedGridState.getInstance().markDirty();
    }

    const nextState: GameState = {
      ...workingState,
      provinces: conquest.updatedProvinces,
      nations: intervention.updatedNations,
      turnLogs: updatedLogs,
    };

    return { state: nextState, reportData: fullReportData };
  }
}
