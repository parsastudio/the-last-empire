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
import { MissileInterceptionPhase } from "@/engine/combat/phases/missile-interception-phase";
import { AirSupremacyPhase } from "@/engine/combat/phases/air-supremacy-phase";
import { GroundEngagementPhase } from "@/engine/combat/phases/ground-engagement-phase";
import { BattleCasualtyResolver } from "@/engine/combat/battle-casualty-resolver";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";

export interface BattleCalculationResult {
  isAttackerVictory: boolean;
  valuationRatio: number;
  dronesUsed: number;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  treasuryLooted: number;
  deploymentMoneyCost: number;
  severity: ReportSeverity;
  capturedInfantry: number;
  capturedArmor: number;
  capturedAirDefense: number;
  capturedAirForce: number;
  capturedDrones: number;
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

    let auxiliaryGuarantor: AuxiliaryGuarantorDefense | undefined = undefined;

    let auxAir = 0;
    let auxArm = 0;
    let auxAD = 0;
    let auxInf = 0;
    let effectiveDefenseBudget = 0;

    if (
      guarantorNation &&
      guarantorNation.isAlive &&
      guarantorNation.id !== attacker.id
    ) {
      const defGdp = getNationGdp(defender, provincesMap);
      const isEmergency = Boolean(defender.isEmergencyProtectorate);
      const budgetMultiplier = isEmergency ? 3.0 : 0.3;
      const rawBudget = Math.floor(defGdp * budgetMultiplier);
      const guarantorGdp = getNationGdp(guarantorNation, provincesMap);
      const maxSuperpowerLimit = Math.floor(guarantorGdp * 0.3);
      effectiveDefenseBudget = Math.min(rawBudget, maxSuperpowerLimit);

      const gTech = guarantorNation.military.techLevel;

      auxAir = Math.floor(
        (effectiveDefenseBudget * 0.4) /
          MILITARY_UNIT_STATS.AIR_FORCE.moneyCost,
      );
      auxAD = Math.floor(
        (effectiveDefenseBudget * 0.25) /
          MILITARY_UNIT_STATS.AIR_DEFENSE.moneyCost,
      );
      auxArm = Math.floor(
        (effectiveDefenseBudget * 0.25) / MILITARY_UNIT_STATS.ARMOR.moneyCost,
      );
      auxInf = Math.floor(
        (effectiveDefenseBudget * 0.1) / MILITARY_UNIT_STATS.INFANTRY.moneyCost,
      );

      defAirForce += auxAir;
      defArmor += auxArm;
      defAirDefense += auxAD;
      defInfantry += auxInf;

      auxiliaryGuarantor = {
        guarantorId: guarantorNation.id,
        guarantorName: guarantorNation.name,
        guarantorFlagCode: guarantorNation.flagCode,
        techLevel: gTech,
        isEmergencyProtectorate: isEmergency,
        deployedInfantry: auxInf,
        deployedArmor: auxArm,
        deployedAirDefense: auxAD,
        deployedAirForce: auxAir,
        initialBudgetValuation: effectiveDefenseBudget,
        damageCostIncurred: 0,
      };
    }

    const missilePhase = MissileInterceptionPhase.calculate({
      deployedDrones,
      defAirDefense,
      attDroneMult,
      defAdMult,
    });

    const airPhase = AirSupremacyPhase.calculate({
      deployedAirForce,
      defAirForce,
      defArmor,
      attAirMult,
      defAirMult,
      defArmorMult,
      defAirDefenseRemainingEff: missilePhase.defAirDefenseRemainingEff,
    });

    const groundPhase = GroundEngagementPhase.calculate({
      deployedArmor,
      deployedInfantry,
      defInfantry,
      defArmorAfterAirRaw: airPhase.defArmorAfterAirRaw,
      defArmorAfterAirEff: airPhase.defArmorAfterAirEff,
      defArmorDestroyedByAir: airPhase.defArmorDestroyedByAir,
      attArmorMult,
      attInfMult,
      defArmorMult,
      defInfMult,
    });

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
      rawAttInfantryLost: groundPhase.rawAttInfantryLost,
      rawAttArmorLoss: groundPhase.rawAttArmorLoss,
      rawAttAirLoss: airPhase.rawAttAirLoss,
      rawDefInfantryLost: groundPhase.rawDefInfantryLost,
      rawDefArmorLost: groundPhase.rawDefArmorLost,
      rawDefAirDefenseLost: missilePhase.rawDefAirDefenseLost,
      rawDefAirLoss: airPhase.rawDefAirLoss,
    });

    if (auxiliaryGuarantor && effectiveDefenseBudget > 0) {
      const auxAirLoss = Math.min(
        auxAir,
        Math.floor(
          casualty.netDefAirLost * (auxAir / Math.max(1, defAirForce)),
        ),
      );
      const auxADLoss = Math.min(
        auxAD,
        Math.floor(
          casualty.netDefAirDefenseLost * (auxAD / Math.max(1, defAirDefense)),
        ),
      );
      const auxArmLoss = Math.min(
        auxArm,
        Math.floor(casualty.netDefArmorLost * (auxArm / Math.max(1, defArmor))),
      );
      const auxInfLoss = Math.min(
        auxInf,
        Math.floor(
          casualty.netDefInfantryLost * (auxInf / Math.max(1, defInfantry)),
        ),
      );

      const totalLossMoney =
        auxAirLoss * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
        auxADLoss * MILITARY_UNIT_STATS.AIR_DEFENSE.moneyCost +
        auxArmLoss * MILITARY_UNIT_STATS.ARMOR.moneyCost +
        auxInfLoss * MILITARY_UNIT_STATS.INFANTRY.moneyCost;

      auxiliaryGuarantor.damageCostIncurred = Math.min(
        effectiveDefenseBudget,
        totalLossMoney,
      );
    }

    const defenderGdp = getNationGdp(defender, provincesMap);
    const guaranteedLootPool =
      Math.max(0, defender.treasury) + Math.floor(defenderGdp * 0.05);

    const defenderTotalTerritory =
      NationGettersUtility.getTerritoryPixelCount(defender.id, provincesMap) ||
      1;
    const treasuryLootRatio = groundPhase.isAttackerVictory
      ? Math.min(0.2, 1000 / defenderTotalTerritory)
      : 0;

    const treasuryLooted = Math.floor(guaranteedLootPool * treasuryLootRatio);

    let severity: ReportSeverity = "INFO";
    if (groundPhase.isAttackerVictory) {
      severity = "VICTORY";
    } else {
      severity =
        casualty.netAttInfantryLost > deployedInfantry * 0.5
          ? "CRITICAL_DEFEAT"
          : "DEFEAT";
    }

    let phase1Winner: "ATTACKER" | "DEFENDER" | "DRAW" | "SKIPPED" = "SKIPPED";
    if (deployedDrones > 0) {
      if (casualty.netDefAirDefenseLost > 0) {
        phase1Winner = "ATTACKER";
      } else if (defAirDefense > 0) {
        phase1Winner = "DEFENDER";
      } else {
        phase1Winner = "DRAW";
      }
    }

    let phase2Winner: "ATTACKER" | "DEFENDER" | "DRAW" = "DRAW";
    if (deployedAirForce > 0 || defAirForce > 0) {
      const attAirLossRatio =
        deployedAirForce > 0 ? casualty.netAttAirLost / deployedAirForce : 1;
      const defAirLossRatio =
        defAirForce > 0 ? casualty.netDefAirLost / defAirForce : 1;

      if (
        casualty.netDefAirLost > casualty.netAttAirLost ||
        (airPhase.defArmorDestroyedByAir > 0 &&
          casualty.netAttAirLost <= casualty.netDefAirLost)
      ) {
        phase2Winner = "ATTACKER";
      } else if (casualty.netAttAirLost > casualty.netDefAirLost) {
        phase2Winner = "DEFENDER";
      } else if (attAirLossRatio < defAirLossRatio) {
        phase2Winner = "ATTACKER";
      } else if (defAirLossRatio < attAirLossRatio) {
        phase2Winner = "DEFENDER";
      }
    }

    const phase3Winner = groundPhase.isAttackerVictory
      ? "ATTACKER"
      : "DEFENDER";

    return {
      isAttackerVictory: groundPhase.isAttackerVictory,
      valuationRatio,
      dronesUsed: deployedDrones,
      attackerCasualties: casualty.attackerCasualties,
      defenderCasualties: casualty.defenderCasualties,
      treasuryLooted,
      deploymentMoneyCost,
      severity,
      capturedInfantry: 0,
      capturedArmor: 0,
      capturedAirDefense: 0,
      capturedAirForce: 0,
      capturedDrones: 0,
      phase1Missile: {
        dronesLaunched: deployedDrones,
        defAirDefense,
        airDefenseLost: casualty.netDefAirDefenseLost,
        dronesIntercepted: Math.min(deployedDrones, defAirDefense * 2),
        phaseWinner: phase1Winner,
      },
      phase2Air: {
        attAirForce: deployedAirForce,
        defAirForce,
        attAirLost: casualty.netAttAirLost,
        defAirLost: casualty.netDefAirLost,
        defArmorDestroyedByAir: airPhase.defArmorDestroyedByAir,
        phaseWinner: phase2Winner,
      },
      phase3Ground: {
        attArmor: deployedArmor,
        defArmor,
        attArmorLost: casualty.netAttArmorLost,
        defArmorLost: casualty.netDefArmorLost,
        attInfantry: deployedInfantry,
        defInfantry,
        attInfantryLost: casualty.netAttInfantryLost,
        defInfantryLost: casualty.netDefInfantryLost,
        phaseWinner: phase3Winner,
      },
      auxiliaryGuarantor,
    };
  }
}
