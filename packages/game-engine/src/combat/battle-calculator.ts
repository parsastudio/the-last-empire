import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  CasualtyMetrics,
  ReportSeverity,
  BattlePhaseReconDetail,
  BattlePhaseAirDetail,
  BattlePhaseGroundDetail,
} from "@/domain/reports/combat-report.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";
import { MissileInterceptionPhase } from "@/engine/combat/phases/missile-interception-phase";
import { AirSupremacyPhase } from "@/engine/combat/phases/air-supremacy-phase";
import { GroundEngagementPhase } from "@/engine/combat/phases/ground-engagement-phase";
import { BattleCasualtyResolver } from "@/engine/combat/battle-casualty-resolver";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";

export interface BattleCalculationResult {
  isAttackerVictory: boolean;
  isFullCapitulation: boolean;
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
  capturedNavalFleet: number;
  phase1Missile: BattlePhaseReconDetail;
  phase2Air: BattlePhaseAirDetail;
  phase3Ground: BattlePhaseGroundDetail;
}

export class BattleCalculator {
  public static calculateBattle(
    attacker: Nation,
    defender: Nation,
    dronesToLaunch: number,
    infantryToDeploy?: number,
    armorToDeploy?: number,
    airForceToDeploy?: number,
    attackType?: "LAND" | "NAVAL",
    navalCostMultiplier?: number,
    provincesMap?: Record<string, Province>,
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
      CombatModifierResolver.calculateDeploymentCosts(
        totalForceCost,
        attackType,
        navalCostMultiplier,
      );

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

    const defAirDefense = defender.military.airDefense || 0;
    const defAirForce = defender.military.airForce || 0;
    const defArmor = defender.military.armor || 0;
    const defInfantry = defender.military.infantry || 0;

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

    const attackerDeployedValuation =
      MilitaryPricingCalculator.calculateLandAndAirValuation(
        {
          infantry: deployedInfantry,
          armor: deployedArmor,
          airDefense: 0,
          airForce: deployedAirForce,
          droneMissile: deployedDrones,
          techLevel: attacker.military.techLevel,
          branchTech: attacker.military.branchTech,
        },
        attacker.industrialLevel,
      );

    const defenderTotalValuation =
      MilitaryPricingCalculator.calculateLandAndAirValuation(
        {
          infantry: defender.military.infantry,
          armor: defender.military.armor,
          airDefense: defender.military.airDefense,
          airForce: defender.military.airForce,
          droneMissile: defender.military.droneMissile,
          techLevel: defender.military.techLevel,
          branchTech: defender.military.branchTech,
        },
        defender.industrialLevel,
      );

    const valuationRatio =
      defenderTotalValuation <= 0
        ? 999
        : Number(
            (attackerDeployedValuation / defenderTotalValuation).toFixed(2),
          );

    const isFullCapitulation =
      groundPhase.isAttackerVictory && valuationRatio >= 4.0;

    const casualty = BattleCasualtyResolver.resolve({
      deployedInfantry,
      deployedArmor,
      deployedAirForce,
      deployedDrones,
      attackerNaval: attacker.military.navalFleet || 0,
      defInfantry,
      defArmor,
      defAirDefense,
      defAirForce,
      defenderNaval: defender.military.navalFleet || 0,
      rawAttInfantryLost: groundPhase.rawAttInfantryLost,
      rawAttArmorLoss: groundPhase.rawAttArmorLoss,
      rawAttAirLoss: airPhase.rawAttAirLoss,
      rawDefInfantryLost: groundPhase.rawDefInfantryLost,
      rawDefArmorLost: groundPhase.rawDefArmorLost,
      rawDefAirDefenseLost: missilePhase.rawDefAirDefenseLost,
      rawDefAirLoss: airPhase.rawDefAirLoss,
      isFullCapitulation,
    });

    const defenderRemainingInfantry = Math.max(
      0,
      defInfantry - casualty.netDefInfantryLost,
    );
    const defenderRemainingArmor = Math.max(
      0,
      defArmor - casualty.netDefArmorLost,
    );
    const defenderRemainingAD = Math.max(
      0,
      defAirDefense - casualty.netDefAirDefenseLost,
    );
    const defenderRemainingAir = Math.max(
      0,
      defAirForce - casualty.netDefAirLost,
    );

    const capturedInfantry = isFullCapitulation ? defenderRemainingInfantry : 0;
    const capturedArmor = isFullCapitulation ? defenderRemainingArmor : 0;
    const capturedAirDefense = isFullCapitulation ? defenderRemainingAD : 0;
    const capturedAirForce = isFullCapitulation ? defenderRemainingAir : 0;
    const capturedDrones = isFullCapitulation
      ? defender.military.droneMissile || 0
      : 0;
    const capturedNavalFleet = isFullCapitulation
      ? defender.military.navalFleet || 0
      : 0;

    const defenderGdp = getNationGdp(defender, provincesMap);
    const guaranteedLootPool =
      Math.max(0, defender.treasury) + Math.floor(defenderGdp * 0.05);

    const defenderTotalTerritory =
      NationGettersUtility.getTerritoryPixelCount(defender.id, provincesMap) ||
      1;
    const treasuryLootRatio = groundPhase.isAttackerVictory
      ? isFullCapitulation
        ? 1.0
        : Math.min(0.2, 1000 / defenderTotalTerritory)
      : 0;

    const treasuryLooted = Math.floor(guaranteedLootPool * treasuryLootRatio);

    let severity: ReportSeverity = "INFO";
    if (groundPhase.isAttackerVictory) {
      severity = isFullCapitulation ? "CRUSHING_VICTORY" : "VICTORY";
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
      isFullCapitulation,
      valuationRatio,
      dronesUsed: deployedDrones,
      attackerCasualties: casualty.attackerCasualties,
      defenderCasualties: casualty.defenderCasualties,
      treasuryLooted,
      deploymentMoneyCost,
      severity,
      capturedInfantry,
      capturedArmor,
      capturedAirDefense,
      capturedAirForce,
      capturedDrones,
      capturedNavalFleet,
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
    };
  }
}
