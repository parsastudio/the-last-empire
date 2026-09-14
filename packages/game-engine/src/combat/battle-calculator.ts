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
import { BattleLootEvaluator } from "@/engine/combat/calculator/battle-loot-evaluator";
import { BattlePhaseOrchestrator } from "@/engine/combat/calculator/battle-phase-orchestrator";
import { GuarantorMultiplierBlender } from "@/engine/combat/optimizer/helpers/guarantor-multiplier-blender";
import {
  NationalProjectEffectApplierUtility,
  MilitaryPricingCalculator,
} from "@geopolitics/domain";

export interface BattleCalculationResult {
  isAttackerVictory: boolean;
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
    dronesToLaunch = 0,
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
      MilitaryPricingCalculator.calculateTotalArmyValuation({
        infantry: deployedInfantry,
        armor: deployedArmor,
        airForce: deployedAirForce,
        droneMissile: deployedDrones,
      });

    const { moneyCost: deploymentMoneyCost } =
      CombatModifierResolver.calculateDeploymentCosts(totalForceCost);

    const attMults = CombatModifierResolver.resolveAllUnitMultipliers(attacker);

    const blendedDef = GuarantorMultiplierBlender.blend(
      attacker,
      defender,
      provincesMap,
      guarantorNation,
    );

    const autoInterceptionBonus =
      NationalProjectEffectApplierUtility.getCombinedBonus(
        defender.completedProjectIds,
        "autoMissileInterceptionRate",
      );

    const phasesResult = BattlePhaseOrchestrator.executePhases(
      deployedDrones,
      blendedDef.defAirDefense,
      deployedAirForce,
      blendedDef.defAirForce,
      deployedArmor,
      blendedDef.defArmor,
      deployedInfantry,
      blendedDef.defInfantry,
      attMults.droneMissile,
      blendedDef.defMults.airDefense,
      attMults.airForce,
      blendedDef.defMults.airForce,
      attMults.armor,
      blendedDef.defMults.armor,
      attMults.infantry,
      blendedDef.defMults.infantry,
      autoInterceptionBonus,
    );

    const attackerDeployedPower = Math.max(
      0.1,
      deployedInfantry *
        MILITARY_UNIT_STATS.INFANTRY.weightPower *
        attMults.infantry +
        deployedArmor * MILITARY_UNIT_STATS.ARMOR.weightPower * attMults.armor +
        deployedAirForce *
          MILITARY_UNIT_STATS.AIR_FORCE.weightPower *
          attMults.airForce +
        deployedDrones *
          MILITARY_UNIT_STATS.DRONE_MISSILE.weightPower *
          attMults.droneMissile,
    );

    const defenderTotalPower = Math.max(
      0.1,
      blendedDef.defInfantry *
        MILITARY_UNIT_STATS.INFANTRY.weightPower *
        blendedDef.defMults.infantry +
        blendedDef.defArmor *
          MILITARY_UNIT_STATS.ARMOR.weightPower *
          blendedDef.defMults.armor +
        blendedDef.defAirDefense *
          MILITARY_UNIT_STATS.AIR_DEFENSE.weightPower *
          blendedDef.defMults.airDefense +
        blendedDef.defAirForce *
          MILITARY_UNIT_STATS.AIR_FORCE.weightPower *
          blendedDef.defMults.airForce,
    );

    const valuationRatio = Number(
      (attackerDeployedPower / defenderTotalPower).toFixed(2),
    );

    const defCasualtyDiscount =
      NationalProjectEffectApplierUtility.getCombinedDiscountMultiplier(
        defender.completedProjectIds,
        "defenseCasualtyReductionMultiplier",
      );

    const casualty = BattleCasualtyResolver.resolve({
      deployedInfantry,
      deployedArmor,
      deployedAirForce,
      deployedDrones,
      defInfantry: blendedDef.defInfantry,
      defArmor: blendedDef.defArmor,
      defAirDefense: blendedDef.defAirDefense,
      defAirForce: blendedDef.defAirForce,
      rawAttInfantryLost: phasesResult.groundPhaseOutput.rawAttInfantryLost,
      rawAttArmorLoss: phasesResult.groundPhaseOutput.rawAttArmorLoss,
      rawAttAirLoss: phasesResult.airPhaseOutput.rawAttAirLoss,
      rawDefInfantryLost: phasesResult.groundPhaseOutput.rawDefInfantryLost,
      rawDefArmorLost: phasesResult.groundPhaseOutput.rawDefArmorLost,
      rawDefAirDefenseLost:
        phasesResult.missilePhaseOutput.rawDefAirDefenseLost,
      rawDefAirLoss: phasesResult.airPhaseOutput.rawDefAirLoss,
      defCasualtyDiscount,
    });

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
      auxiliaryGuarantor: blendedDef.auxiliaryGuarantor,
    };
  }
}
