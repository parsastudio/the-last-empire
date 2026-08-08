import { Nation } from "@/domain/nation/nation.schema";
import {
  CasualtyMetrics,
  ReportSeverity,
} from "@/domain/reports/combat-report.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MARKET_CONFIG } from "@/domain/economy/market.config";

export interface BattleCalculationResult {
  isAttackerVictory: boolean;
  dronesUsed: number;
  droneCasualtiesInflicted: number;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  conqueredPixelsCount: number;
  treasuryLooted: number;
  deploymentMoneyCost: number;
  deploymentOilCost: number;
  airSupportMultiplier: number;
  severity: ReportSeverity;
}

export class BattleCalculator {
  public static calculateBattle(
    attacker: Nation,
    defender: Nation,
    dronesToLaunch: number,
    oilPrice: number = MARKET_CONFIG.FIXED_BUY_PRICE,
  ): BattleCalculationResult {
    const totalForceCost =
      attacker.military.infantry * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      attacker.military.airForce * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      (dronesToLaunch || 0) * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost;

    const deploymentFivePct = totalForceCost * 0.05;
    const deploymentMoneyCost = Math.floor(deploymentFivePct);
    const deploymentOilCost = Math.max(
      1,
      Math.ceil(
        deploymentFivePct / (oilPrice || MARKET_CONFIG.FIXED_BUY_PRICE),
      ),
    );

    const dronesUsed = Math.min(
      attacker.military.droneMissile,
      Math.max(0, dronesToLaunch || 0),
    );

    const attackerGovTraits = GovernmentSystem.getTraits(
      attacker.government.type,
    );
    const defenderGovTraits = GovernmentSystem.getTraits(
      defender.government.type,
    );

    let attackerGovMult = attackerGovTraits.militaryPowerMultiplier;
    let defenderGovMult = defenderGovTraits.militaryPowerMultiplier;

    if (attacker.traits.includes("MILITARISTIC")) {
      attackerGovMult *= 1.15;
    }
    if (defender.traits.includes("MILITARISTIC")) {
      defenderGovMult *= 1.15;
    }

    const techMultiplier = 1 + (attacker.military.techLevel - 1) * 0.25;
    const droneMult = DoctrinesManager.getDronePowerMultiplier(
      attacker.doctrines?.unlockedDoctrines,
    );

    let droneCasualtiesInflicted = Math.floor(
      dronesUsed * 3 * techMultiplier * attackerGovMult * droneMult,
    );

    const defenderAirDefenseRate =
      DoctrinesManager.getAirDefenseInterceptionRate(
        defender.doctrines?.unlockedDoctrines,
      );
    if (defenderAirDefenseRate > 0) {
      droneCasualtiesInflicted = Math.floor(
        droneCasualtiesInflicted * (1.0 - defenderAirDefenseRate),
      );
    }

    let defenderRemainingInfantry = defender.military.infantry;
    let defenderRemainingAirForce = defender.military.airForce;

    const precisionDamageRatio =
      DoctrinesManager.getPrecisionMissileDirectDamage(
        attacker.doctrines?.unlockedDoctrines,
      );
    if (precisionDamageRatio > 0 && dronesUsed > 0) {
      const directInfantryDestroyed = Math.floor(
        defenderRemainingInfantry * precisionDamageRatio * 0.1,
      );
      defenderRemainingInfantry = Math.max(
        0,
        defenderRemainingInfantry - directInfantryDestroyed,
      );
    }

    const infantryDestroyedByDrones = Math.min(
      defenderRemainingInfantry,
      droneCasualtiesInflicted,
    );
    defenderRemainingInfantry -= infantryDestroyedByDrones;

    const remainingDroneCasualties =
      droneCasualtiesInflicted - infantryDestroyedByDrones;
    let airForceDestroyedByDrones = 0;
    if (remainingDroneCasualties > 0 && defenderRemainingAirForce > 0) {
      airForceDestroyedByDrones = Math.min(
        defenderRemainingAirForce,
        Math.floor(remainingDroneCasualties / 3),
      );
      defenderRemainingAirForce -= airForceDestroyedByDrones;
    }

    const attackerAirPower =
      attacker.military.airForce *
      (1 + (attacker.military.techLevel - 1) * 0.2) *
      (1 + attacker.military.experience / 100) *
      attackerGovMult;

    let defenderAirPower =
      defenderRemainingAirForce *
      (1 + (defender.military.techLevel - 1) * 0.2) *
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

      if (
        DoctrinesManager.getElectronicWarfareEvasion(
          attacker.doctrines?.unlockedDoctrines,
        )
      ) {
        attackerAirLossPct *= 0.8;
      }

      attackerAirLoss = Math.min(
        attacker.military.airForce,
        Math.floor(attacker.military.airForce * attackerAirLossPct),
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

    const militiaMult = DoctrinesManager.getMilitiaPowerMultiplier(
      defender.doctrines?.unlockedDoctrines,
    );

    const militiaGarrison = Math.floor(
      Math.max(
        10,
        Math.floor(
          (defender.population / 100000) *
            (defender.government.stability / 100),
        ),
      ) * militiaMult,
    );

    const attackerGroundPower =
      attacker.military.infantry *
      (1 + (attacker.military.techLevel - 1) * 0.2) *
      (1 + attacker.military.experience / 100) *
      airSupportMultiplier *
      attackerGovMult;

    const defenderGroundPower =
      (defenderRemainingInfantry + militiaGarrison) *
      (1 + (defender.military.techLevel - 1) * 0.2) *
      (1 + defender.military.experience / 100) *
      defenderGovMult;

    const totalGroundPower = attackerGroundPower + defenderGroundPower;

    let attackerInfantryLoss = 0;
    let defenderInfantryLoss = 0;

    if (totalGroundPower > 0) {
      const attackerLossPct = (defenderGroundPower / totalGroundPower) * 0.25;
      const defenderLossPct = (attackerGroundPower / totalGroundPower) * 0.25;

      attackerInfantryLoss = Math.min(
        attacker.military.infantry,
        Math.floor(attacker.military.infantry * attackerLossPct),
      );
      defenderInfantryLoss = Math.min(
        defenderRemainingInfantry,
        Math.floor(defenderRemainingInfantry * defenderLossPct),
      );
    }

    const isAttackerVictory = attackerGroundPower > defenderGroundPower;

    let conqueredPixelsCount = 0;
    let treasuryLooted = 0;

    if (isAttackerVictory) {
      const powerDiffRatio =
        (attackerGroundPower - defenderGroundPower) /
        (attackerGroundPower || 1);

      const defenderTotalPixels = defender.geography.territoryPixelCount;

      let conquestRatio = 0.25 + powerDiffRatio * 0.25;
      conquestRatio = Math.max(0.25, Math.min(0.5, conquestRatio));

      let calculatedConquest = Math.floor(defenderTotalPixels * conquestRatio);
      calculatedConquest = Math.max(1000, calculatedConquest);

      if (defenderTotalPixels <= 1000) {
        conqueredPixelsCount = defenderTotalPixels;
      } else {
        const remainingPixels = defenderTotalPixels - calculatedConquest;
        if (remainingPixels < 10 || calculatedConquest >= defenderTotalPixels) {
          conqueredPixelsCount = defenderTotalPixels;
        } else {
          conqueredPixelsCount = calculatedConquest;
        }
      }

      const actualRatio =
        defenderTotalPixels > 0
          ? Math.min(1.0, conqueredPixelsCount / defenderTotalPixels)
          : 1.0;

      treasuryLooted = Math.floor(Math.max(0, defender.treasury) * actualRatio);
    }

    let severity: ReportSeverity = "INFO";
    if (isAttackerVictory) {
      severity =
        conqueredPixelsCount >= defender.geography.territoryPixelCount
          ? "CRUSHING_VICTORY"
          : "VICTORY";
    } else {
      severity =
        attackerInfantryLoss > attacker.military.infantry * 0.4
          ? "CRITICAL_DEFEAT"
          : "DEFEAT";
    }

    const attackerCasualties: CasualtyMetrics = {
      infantryEngaged: attacker.military.infantry,
      infantryLost: attackerInfantryLoss,
      airForceEngaged: attacker.military.airForce,
      airForceLost: attackerAirLoss,
      droneMissileEngaged: dronesUsed,
      droneMissileLost: dronesUsed,
    };

    const defenderCasualties: CasualtyMetrics = {
      infantryEngaged: defender.military.infantry,
      infantryLost: defenderInfantryLoss + infantryDestroyedByDrones,
      airForceEngaged: defender.military.airForce,
      airForceLost: defenderAirLoss + airForceDestroyedByDrones,
      droneMissileEngaged: defender.military.droneMissile,
      droneMissileLost: 0,
      militiaGarrisonPower: militiaGarrison,
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
      deploymentOilCost,
      airSupportMultiplier,
      severity,
    };
  }
}
