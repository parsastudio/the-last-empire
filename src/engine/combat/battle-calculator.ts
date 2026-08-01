import { Nation } from "@/domain/nation/nation.schema";
import {
  CasualtyMetrics,
  ReportSeverity,
} from "@/domain/reports/combat-report.schema";

export interface BattleCalculationResult {
  isAttackerVictory: boolean;
  dronesUsed: number;
  droneCasualtiesInflicted: number;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  conqueredAreaSqKm: number;
  treasuryLooted: number;
  airSupportMultiplier: number;
  severity: ReportSeverity;
}

export class BattleCalculator {
  public static calculateBattle(
    attacker: Nation,
    defender: Nation,
    dronesToLaunch: number,
  ): BattleCalculationResult {
    const dronesUsed = Math.min(
      attacker.military.droneMissile,
      Math.max(0, dronesToLaunch),
    );

    const techMultiplier = 1 + (attacker.military.techLevel - 1) * 0.25;
    const droneCasualtiesInflicted = Math.floor(
      dronesUsed * 3 * techMultiplier,
    );

    let defenderRemainingInfantry = defender.military.infantry;
    let defenderRemainingAirForce = defender.military.airForce;

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
      (1 + attacker.military.experience / 100);

    const defenderAirPower =
      defenderRemainingAirForce *
      (1 + (defender.military.techLevel - 1) * 0.2) *
      (1 + defender.military.experience / 100);

    const totalAirPower = attackerAirPower + defenderAirPower;

    let attackerAirLoss = 0;
    let defenderAirLoss = 0;

    if (totalAirPower > 0) {
      const attackerAirLossPct = (defenderAirPower / totalAirPower) * 0.2;
      const defenderAirLossPct = (attackerAirPower / totalAirPower) * 0.2;

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

    const militiaGarrison = Math.max(
      10,
      Math.floor(
        (defender.population / 100000) * (defender.government.stability / 100),
      ),
    );

    const attackerGroundPower =
      attacker.military.infantry *
      (1 + (attacker.military.techLevel - 1) * 0.2) *
      (1 + attacker.military.experience / 100) *
      airSupportMultiplier;

    const defenderGroundPower =
      (defenderRemainingInfantry + militiaGarrison) *
      (1 + (defender.military.techLevel - 1) * 0.2) *
      (1 + defender.military.experience / 100);

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

    let conqueredAreaSqKm = 0;
    let treasuryLooted = 0;

    if (isAttackerVictory) {
      const powerDiffRatio =
        (attackerGroundPower - defenderGroundPower) /
        (attackerGroundPower || 1);

      const defenderTotalTerritory = defender.geography.territorySize;

      let conquestRatio = 0.25 + powerDiffRatio * 0.25;
      conquestRatio = Math.max(0.25, Math.min(0.5, conquestRatio));

      let calculatedConquest = Math.floor(
        defenderTotalTerritory * conquestRatio,
      );
      calculatedConquest = Math.max(50000, calculatedConquest);

      if (defenderTotalTerritory <= 50000) {
        conqueredAreaSqKm = defenderTotalTerritory;
      } else {
        const remainingTerritory = defenderTotalTerritory - calculatedConquest;
        if (
          remainingTerritory < 10000 ||
          calculatedConquest >= defenderTotalTerritory
        ) {
          conqueredAreaSqKm = defenderTotalTerritory;
        } else {
          conqueredAreaSqKm = calculatedConquest;
        }
      }

      const actualRatio =
        defenderTotalTerritory > 0
          ? Math.min(1.0, conqueredAreaSqKm / defenderTotalTerritory)
          : 1.0;

      treasuryLooted = Math.floor(Math.max(0, defender.treasury) * actualRatio);
    }

    let severity: ReportSeverity = "INFO";
    if (isAttackerVictory) {
      severity =
        conqueredAreaSqKm >= defender.geography.territorySize
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
      conqueredAreaSqKm,
      treasuryLooted,
      airSupportMultiplier,
      severity,
    };
  }
}
