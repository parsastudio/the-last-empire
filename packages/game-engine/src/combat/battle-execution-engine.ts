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
import { ExtraCapturedMilitaryUnits } from "@/engine/combat/loot/battle-loot-manager";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

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
      state.provinces,
    );

    const conquest = ProvinceConquestHandler.handleConquest(
      state.provinces,
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
      const survivingDefenderNaval = Math.max(
        0,
        defender.military.navalFleet || 0,
      );

      extraCapturedUnits = {
        infantry: survivingDefenderInf,
        armor: survivingDefenderArmor,
        airDefense: survivingDefenderAD,
        airForce: survivingDefenderAir,
        droneMissile: survivingDefenderDrones,
        navalFleet: survivingDefenderNaval,
      };

      extraTreasuryLooted = Math.max(
        0,
        defender.treasury - calcResult.treasuryLooted,
      );
    }

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
    });

    const updatedDefender = BattleDefenderStateApplier.apply({
      defender,
      attackerId: attacker.id,
      calcResult,
      conquest,
      isDefenderAlive,
    });

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

    const betrayalText = betrayalResult.hasBetrayed ? "BETRAYAL" : "";

    const battleLogs = BattleLogFactory.createBattleLogs(
      state.currentTurn,
      updatedAttacker,
      updatedDefender,
      calcResult,
      betrayalText,
      state.humanNationId,
      !isDefenderAlive,
    );

    const interventionLogs = BattleLogFactory.createInterventionLogs(
      state.currentTurn,
      intervention,
      updatedAttacker,
      updatedDefender,
      state.humanNationId,
    );

    const updatedLogs = [...state.turnLogs, ...battleLogs, ...interventionLogs];

    if (conquest.conqueredProvincesList.length > 0) {
      BitPackedGridState.getInstance().markDirty();
    }

    return {
      ...state,
      provinces: conquest.updatedProvinces,
      nations: intervention.updatedNations,
      turnLogs: updatedLogs,
    };
  }
}
