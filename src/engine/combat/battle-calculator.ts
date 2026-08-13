import { Nation } from "@/domain/nation/nation.schema";
import {
  CasualtyMetrics,
  ReportSeverity,
} from "@/domain/reports/combat-report.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";

export interface BattleCalculationResult {
  isAttackerVictory: boolean;
  dronesUsed: number;
  droneCasualtiesInflicted: number;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  conqueredPixelsCount: number;
  treasuryLooted: number;
  deploymentMoneyCost: number;
  airSupportMultiplier: number;
  severity: ReportSeverity;
}

export class BattleCalculator {
  public static calculateBattle(
    attacker: Nation,
    defender: Nation,
    dronesToLaunch: number,
    infantryToDeploy?: number,
    airForceToDeploy?: number,
    targetEnclaveId?: number,
    attackType?: "LAND" | "NAVAL",
    navalCostMultiplier?: number,
  ): BattleCalculationResult {
    const deployedInfantry = Math.min(
      attacker.military.infantry,
      Math.max(1, infantryToDeploy ?? attacker.military.infantry),
    );
    const deployedAirForce = Math.min(
      attacker.military.airForce,
      Math.max(0, airForceToDeploy ?? attacker.military.airForce),
    );

    const totalForceCost =
      deployedInfantry * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      (attacker.military.armor || 0) * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      deployedAirForce * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      (dronesToLaunch || 0) * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost;

    const { moneyCost: deploymentMoneyCost } =
      CombatModifierResolver.calculateDeploymentCosts(
        totalForceCost,
        attackType,
        navalCostMultiplier,
      );

    const dronesUsed = Math.min(
      attacker.military.droneMissile,
      Math.max(0, dronesToLaunch || 0),
    );

    const { attackerGovMult, defenderGovMult } =
      CombatModifierResolver.getCombatPowerModifiers(attacker, defender);

    let rawDroneCasualties = CombatModifierResolver.getDroneStrikeEffectiveness(
      attacker,
      defender,
      dronesUsed,
      attackerGovMult,
    );

    const defenderAirDefensePower =
      (defender.military.airDefense || 0) *
      (1 + (defender.military.techLevel - 1) * 0.5);

    if (defenderAirDefensePower > 0) {
      const interceptionFactor = Math.min(
        0.8,
        defenderAirDefensePower / (dronesUsed + 1),
      );
      rawDroneCasualties = Math.floor(
        rawDroneCasualties * (1 - interceptionFactor),
      );
    }

    const droneCasualtiesInflicted = Math.max(0, rawDroneCasualties);

    let defenderRemainingInfantry = defender.military.infantry;
    let defenderRemainingArmor = defender.military.armor || 0;
    const defenderRemainingAirForce = defender.military.airForce;

    const armorDestroyedByDrones = Math.min(
      defenderRemainingArmor,
      Math.floor(droneCasualtiesInflicted / 3),
    );
    defenderRemainingArmor -= armorDestroyedByDrones;

    const infantryDestroyedByDrones = Math.min(
      defenderRemainingInfantry,
      droneCasualtiesInflicted,
    );
    defenderRemainingInfantry -= infantryDestroyedByDrones;

    const attackerAirPower =
      deployedAirForce *
      (1 + (attacker.military.techLevel - 1) * 0.5) *
      (1 + attacker.military.experience / 100) *
      attackerGovMult;

    let defenderAirPower =
      defenderRemainingAirForce *
      (1 + (defender.military.techLevel - 1) * 0.5) *
      (1 + defender.military.experience / 100) *
      defenderGovMult;

    if (
      DoctrinesManager.getElectronicWarfareEvasion(
        attacker.doctrines?.unlockedDoctrines,
      )
    ) {
      defenderAirPower *= 0.5;
    }

    const totalAirPower = attackerAirPower + defenderAirPower;

    let attackerAirLoss = 0;
    let defenderAirLoss = 0;

    if (totalAirPower > 0) {
      let attackerAirLossPct = (defenderAirPower / totalAirPower) * 0.2;
      const defenderAirLossPct = (attackerAirPower / totalAirPower) * 0.2;

      if (defenderAirDefensePower > 0) {
        attackerAirLossPct += Math.min(0.3, defenderAirDefensePower * 0.05);
      }

      attackerAirLoss = Math.min(
        deployedAirForce,
        Math.floor(deployedAirForce * attackerAirLossPct),
      );
      defenderAirLoss = Math.min(
        defenderRemainingAirForce,
        Math.floor(defenderRemainingAirForce * defenderAirLossPct),
      );
    }

    const airRatio = attackerAirPower / (defenderAirPower + 1);
    let airSupportMultiplier = 1.0;
    if (airRatio >= 1.5) {
      airSupportMultiplier = 1.5;
    } else if (airRatio <= 0.7) {
      airSupportMultiplier = 0.7;
    }

    const attackerGroundPower =
      (deployedInfantry * 1.0 + (attacker.military.armor || 0) * 3.0) *
      (1 + (attacker.military.techLevel - 1) * 0.5) *
      (1 + attacker.military.experience / 100) *
      airSupportMultiplier *
      attackerGovMult;

    const defenderGroundPower =
      (defenderRemainingInfantry * 1.0 + defenderRemainingArmor * 3.0) *
      (1 + (defender.military.techLevel - 1) * 0.5) *
      (1 + defender.military.experience / 100) *
      defenderGovMult;

    const totalGroundPower = attackerGroundPower + defenderGroundPower;

    let attackerInfantryLoss = 0;
    let defenderInfantryLoss = 0;
    let defenderArmorLoss = 0;

    if (totalGroundPower > 0) {
      const attackerLossPct = (defenderGroundPower / totalGroundPower) * 0.25;
      const defenderLossPct = (attackerGroundPower / totalGroundPower) * 0.25;

      attackerInfantryLoss = Math.min(
        deployedInfantry,
        Math.floor(deployedInfantry * attackerLossPct),
      );
      defenderInfantryLoss = Math.min(
        defenderRemainingInfantry,
        Math.floor(defenderRemainingInfantry * defenderLossPct),
      );
      defenderArmorLoss = Math.min(
        defenderRemainingArmor,
        Math.floor(defenderRemainingArmor * defenderLossPct),
      );
    }

    const isAttackerVictory = attackerGroundPower > defenderGroundPower;

    let conqueredPixelsCount = 0;
    let treasuryLooted = 0;

    const targetRegion =
      targetEnclaveId !== undefined && defender.regionsDemographics
        ? defender.regionsDemographics.find(
            (r) => r.regionId === targetEnclaveId,
          )
        : undefined;

    const targetRegionPixels = targetRegion
      ? targetRegion.pixelCount
      : defender.geography.territoryPixelCount;

    if (isAttackerVictory) {
      const powerDiffRatio =
        (attackerGroundPower - defenderGroundPower) /
        (attackerGroundPower || 1);

      let conquestRatio = 0.25 + powerDiffRatio * 0.25;
      conquestRatio = Math.max(0.25, Math.min(1.0, conquestRatio));

      let calculatedConquest = Math.floor(targetRegionPixels * conquestRatio);
      calculatedConquest = Math.max(500, calculatedConquest);

      if (targetRegionPixels <= 1000) {
        conqueredPixelsCount = targetRegionPixels;
      } else {
        const remainingPixels = targetRegionPixels - calculatedConquest;
        if (remainingPixels < 10 || calculatedConquest >= targetRegionPixels) {
          conqueredPixelsCount = targetRegionPixels;
        } else {
          conqueredPixelsCount = calculatedConquest;
        }
      }

      const actualRatio =
        defender.geography.territoryPixelCount > 0
          ? Math.min(
              1.0,
              conqueredPixelsCount / defender.geography.territoryPixelCount,
            )
          : 1.0;

      treasuryLooted = Math.floor(Math.max(0, defender.treasury) * actualRatio);
    }

    let severity: ReportSeverity = "INFO";
    if (isAttackerVictory) {
      severity =
        conqueredPixelsCount >= targetRegionPixels
          ? "CRUSHING_VICTORY"
          : "VICTORY";
    } else {
      severity =
        attackerInfantryLoss > deployedInfantry * 0.4
          ? "CRITICAL_DEFEAT"
          : "DEFEAT";
    }

    const attackerCasualties: CasualtyMetrics = {
      infantryEngaged: deployedInfantry,
      infantryLost: attackerInfantryLoss,
      armorEngaged: attacker.military.armor || 0,
      armorLost: 0,
      airDefenseEngaged: attacker.military.airDefense || 0,
      airDefenseLost: 0,
      airForceEngaged: deployedAirForce,
      airForceLost: attackerAirLoss,
      droneMissileEngaged: dronesUsed,
      droneMissileLost: dronesUsed,
      navalFleetEngaged: attacker.military.navalFleet || 0,
      navalFleetLost: 0,
    };

    const defenderCasualties: CasualtyMetrics = {
      infantryEngaged: defender.military.infantry,
      infantryLost: defenderInfantryLoss + infantryDestroyedByDrones,
      armorEngaged: defender.military.armor || 0,
      armorLost: defenderArmorLoss + armorDestroyedByDrones,
      airDefenseEngaged: defender.military.airDefense || 0,
      airDefenseLost: 0,
      airForceEngaged: defender.military.airForce,
      airForceLost: defenderAirLoss,
      droneMissileEngaged: defender.military.droneMissile,
      droneMissileLost: 0,
      navalFleetEngaged: defender.military.navalFleet || 0,
      navalFleetLost: 0,
    };

    return {
      isAttackerVictory,
      dronesUsed,
      droneCasualtiesInflicted,
      attackerCasualties,
      defenderCasualties,
      conqueredPixelsCount,
      treasuryLooted,
      deploymentMoneyCost,
      airSupportMultiplier,
      severity,
    };
  }
}
