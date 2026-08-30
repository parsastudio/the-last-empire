import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  CasualtyMetrics,
  ReportSeverity,
  BattlePhaseReconDetail,
  BattlePhaseAirDetail,
  BattlePhaseGroundDetail,
  AuxiliaryGuarantorDefense,
} from "@/domain/reports/combat-report.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";
import { BattleCasualtyResolver } from "@/engine/combat/battle-casualty-resolver";
import { GuarantorInterventionCalculator } from "@/engine/combat/calculator/guarantor-intervention-calculator";
import { BattleLootEvaluator } from "@/engine/combat/calculator/battle-loot-evaluator";
import { BattlePhaseOrchestrator } from "@/engine/combat/calculator/battle-phase-orchestrator";

export interface BattleCalculationResult {
  isAttackerVictory: boolean;
  isFullCapitulation?: boolean;
  valuationRatio: number;
  dronesUsed: number;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  treasuryLooted: number;
  deploymentMoneyCost: number;
  severity: ReportSeverity;
  phase1Missile: BattlePhaseReconDetail;
  phase2Air: BattlePhaseAirDetail;
  phase3Ground: BattlePhaseGroundDetail;
  auxiliaryGuarantor?: AuxiliaryGuarantorDefense;
}

export class BattleCalculator {
  public static calculateBattle(
    attacker: Nation,
    defender: Nation,
    dronesToLaunch: number,
    infantryToDeploy?: number,
    armorToDeploy?: number,
    airForceToDeploy?: number,
    provincesMap?: Record<string, Province>,
    guarantorNation?: Nation | null,
  ): BattleCalculationResult {
    const deployedInfantry = Math.min(
      attacker.military.infantry,
      Math.max(1, infantryToDeploy ?? attacker.military.infantry),
    );
    const deployedArmor = Math.min(
      attacker.military.armor || 0,
      Math.max(0, armorToDeploy ?? (attacker.military.armor || 0)),
    );
    const deployedAirForce = Math.min(
      attacker.military.airForce,
      Math.max(0, airForceToDeploy ?? attacker.military.airForce),
    );
    const deployedDrones = Math.min(
      attacker.military.droneMissile,
      Math.max(0, dronesToLaunch || 0),
    );

    const totalForceCost =
      deployedInfantry * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      deployedArmor * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      deployedAirForce * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      deployedDrones * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost;

    const { moneyCost: deploymentMoneyCost } =
      CombatModifierResolver.calculateDeploymentCosts(totalForceCost);

    const attDroneMult = CombatModifierResolver.getUnitMultiplier(
      attacker,
      "DRONE_MISSILE",
    );
    const attAirMult = CombatModifierResolver.getUnitMultiplier(
      attacker,
      "AIR_FORCE",
    );
    const attArmorMult = CombatModifierResolver.getUnitMultiplier(
      attacker,
      "ARMOR",
    );
    const attInfMult = CombatModifierResolver.getUnitMultiplier(
      attacker,
      "INFANTRY",
    );

    const defAdMult = CombatModifierResolver.getUnitMultiplier(
      defender,
      "AIR_DEFENSE",
    );
    const defAirMult = CombatModifierResolver.getUnitMultiplier(
      defender,
      "AIR_FORCE",
    );
    const defArmorMult = CombatModifierResolver.getUnitMultiplier(
      defender,
      "ARMOR",
    );
    const defInfMult = CombatModifierResolver.getUnitMultiplier(
      defender,
      "INFANTRY",
    );

    let defAirDefense = defender.military.airDefense || 0;
    let defAirForce = defender.military.airForce || 0;
    let defArmor = defender.military.armor || 0;
    let defInfantry = defender.military.infantry || 0;

    const guarantorResult =
      GuarantorInterventionCalculator.calculateIntervention(
        attacker,
        defender,
        provincesMap,
        guarantorNation,
      );

    defAirForce += guarantorResult.auxAir;
    defArmor += guarantorResult.auxArm;
    defAirDefense += guarantorResult.auxAD;
    defInfantry += guarantorResult.auxInf;

    const phasesResult = BattlePhaseOrchestrator.executePhases(
      deployedDrones,
      defAirDefense,
      deployedAirForce,
      defAirForce,
      deployedArmor,
      defArmor,
      deployedInfantry,
      defInfantry,
      attDroneMult,
      defAdMult,
      attAirMult,
      defAirMult,
      attArmorMult,
      defArmorMult,
      attInfMult,
      defInfMult,
    );

    const attackerDeployedPower = Math.max(
      0.1,
      deployedInfantry * MILITARY_UNIT_STATS.INFANTRY.weightPower * attInfMult +
        deployedArmor * MILITARY_UNIT_STATS.ARMOR.weightPower * attArmorMult +
        deployedAirForce *
          MILITARY_UNIT_STATS.AIR_FORCE.weightPower *
          attAirMult +
        deployedDrones *
          MILITARY_UNIT_STATS.DRONE_MISSILE.weightPower *
          attDroneMult,
    );

    const defenderTotalPower = Math.max(
      0.1,
      defInfantry * MILITARY_UNIT_STATS.INFANTRY.weightPower * defInfMult +
        defArmor * MILITARY_UNIT_STATS.ARMOR.weightPower * defArmorMult +
        defAirDefense *
          MILITARY_UNIT_STATS.AIR_DEFENSE.weightPower *
          defAdMult +
        defAirForce * MILITARY_UNIT_STATS.AIR_FORCE.weightPower * defAirMult,
    );

    const valuationRatio = Number(
      (attackerDeployedPower / defenderTotalPower).toFixed(2),
    );

    const casualty = BattleCasualtyResolver.resolve({
      deployedInfantry,
      deployedArmor,
      deployedAirForce,
      deployedDrones,
      defInfantry,
      defArmor,
      defAirDefense,
      defAirForce,
      rawAttInfantryLost: phasesResult.groundPhaseOutput.rawAttInfantryLost,
      rawAttArmorLoss: phasesResult.groundPhaseOutput.rawAttArmorLoss,
      rawAttAirLoss: phasesResult.airPhaseOutput.rawAttAirLoss,
      rawDefInfantryLost: phasesResult.groundPhaseOutput.rawDefInfantryLost,
      rawDefArmorLost: phasesResult.groundPhaseOutput.rawDefArmorLost,
      rawDefAirDefenseLost:
        phasesResult.missilePhaseOutput.rawDefAirDefenseLost,
      rawDefAirLoss: phasesResult.airPhaseOutput.rawDefAirLoss,
    });

    if (
      guarantorResult.auxiliaryGuarantor &&
      guarantorResult.effectiveDefenseBudget > 0
    ) {
      GuarantorInterventionCalculator.calculateGuarantorDamageCost(
        guarantorResult.auxiliaryGuarantor,
        guarantorResult.effectiveDefenseBudget,
        guarantorResult.auxAir,
        guarantorResult.auxAD,
        guarantorResult.auxArm,
        guarantorResult.auxInf,
        defAirForce,
        defAirDefense,
        defArmor,
        defInfantry,
        casualty.netDefAirLost,
        casualty.netDefAirDefenseLost,
        casualty.netDefArmorLost,
        casualty.netDefInfantryLost,
      );
    }

    const treasuryLooted = BattleLootEvaluator.calculateLoot(
      defender,
      phasesResult.groundPhaseOutput.isAttackerVictory,
      provincesMap,
    );

    let severity: ReportSeverity = "INFO";
    if (phasesResult.groundPhaseOutput.isAttackerVictory) {
      severity = "VICTORY";
    } else {
      severity =
        casualty.netAttInfantryLost > deployedInfantry * 0.5
          ? "CRITICAL_DEFEAT"
          : "DEFEAT";
    }

    return {
      isAttackerVictory: phasesResult.groundPhaseOutput.isAttackerVictory,
      isFullCapitulation: false,
      valuationRatio,
      dronesUsed: deployedDrones,
      attackerCasualties: casualty.attackerCasualties,
      defenderCasualties: casualty.defenderCasualties,
      treasuryLooted,
      deploymentMoneyCost,
      severity,
      phase1Missile: phasesResult.phase1Missile,
      phase2Air: phasesResult.phase2Air,
      phase3Ground: phasesResult.phase3Ground,
      auxiliaryGuarantor: guarantorResult.auxiliaryGuarantor,
    };
  }
}
