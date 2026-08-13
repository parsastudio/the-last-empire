import { Nation } from "@/domain/nation/nation.schema";
import {
  CasualtyMetrics,
  ReportSeverity,
} from "@/domain/reports/combat-report.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";

export interface BattleCalculationResult {
  isAttackerVictory: boolean;
  isFullCapitulation: boolean;
  dronesUsed: number;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  conqueredPixelsCount: number;
  treasuryLooted: number;
  deploymentMoneyCost: number;
  airSupportMultiplier: number;
  severity: ReportSeverity;
  capturedAirForce: number;
  capturedAirDefense: number;
  capturedNavalFleet: number;
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
    const deployedDrones = Math.min(
      attacker.military.droneMissile,
      Math.max(0, dronesToLaunch || 0),
    );
    const deployedArmor = attacker.military.armor || 0;

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

    const attMult = CombatModifierResolver.getEffectiveMultiplier(attacker);
    const defMult = CombatModifierResolver.getEffectiveMultiplier(defender);

    const defAirDefense = defender.military.airDefense || 0;
    const defAirForce = defender.military.airForce || 0;
    const defArmor = defender.military.armor || 0;
    const defInfantry = defender.military.infantry || 0;

    const attMissilesEff = deployedDrones * attMult;
    const defAirDefenseEff = defAirDefense * defMult;

    const missilesInterceptedEff = Math.min(
      attMissilesEff,
      defAirDefenseEff * 2,
    );
    const missilesLeakedEff = Math.max(
      0,
      attMissilesEff - missilesInterceptedEff,
    );

    const airDefenseDestroyedEff = Math.floor(missilesLeakedEff / 2);
    const defAirDefenseLost = Math.min(
      defAirDefense,
      Math.floor(airDefenseDestroyedEff / defMult),
    );
    const defAirDefenseRemainingRaw = defAirDefense - defAirDefenseLost;
    const defAirDefenseRemainingEff = defAirDefenseRemainingRaw * defMult;

    const attAirEff = deployedAirForce * attMult;
    const defAirEff = defAirForce * defMult;

    const dogfightLossAttEff = Math.min(attAirEff, defAirEff);
    const dogfightLossDefEff = Math.min(attAirEff, defAirEff);

    const attAirLoss = Math.min(
      deployedAirForce,
      Math.ceil(dogfightLossAttEff / attMult),
    );
    const defAirLoss = Math.min(
      defAirForce,
      Math.ceil(dogfightLossDefEff / defMult),
    );

    const survivingAttAirRaw = deployedAirForce - attAirLoss;
    const survivingAttAirEff = survivingAttAirRaw * attMult;

    const fightersSuppressedEff = Math.min(
      survivingAttAirEff,
      defAirDefenseRemainingEff * 2,
    );
    const freeAttAirEff = Math.max(
      0,
      survivingAttAirEff - fightersSuppressedEff,
    );

    const tanksDestroyedByAirEff = freeAttAirEff * 2;
    const defArmorDestroyedByAir = Math.min(
      defArmor,
      Math.floor(tanksDestroyedByAirEff / defMult),
    );
    const defArmorAfterAirRaw = defArmor - defArmorDestroyedByAir;
    const defArmorAfterAirEff = defArmorAfterAirRaw * defMult;

    const attArmorEff = deployedArmor * attMult;
    const tankTradeLossAttEff = Math.min(attArmorEff, defArmorAfterAirEff);
    const tankTradeLossDefEff = Math.min(attArmorEff, defArmorAfterAirEff);

    const attArmorLoss = Math.min(
      deployedArmor,
      Math.ceil(tankTradeLossAttEff / attMult),
    );
    const defArmorLossGround = Math.min(
      defArmorAfterAirRaw,
      Math.ceil(tankTradeLossDefEff / defMult),
    );
    const totalDefArmorLost = defArmorDestroyedByAir + defArmorLossGround;

    const survivingAttArmorEff = Math.max(0, attArmorEff - defArmorAfterAirEff);
    const survivingDefArmorEff = Math.max(0, defArmorAfterAirEff - attArmorEff);

    const defInfantryTotalEff = defInfantry * defMult;
    const defInfantryKilledByTanksEff = Math.min(
      defInfantryTotalEff,
      survivingAttArmorEff * 3,
    );
    const defInfantryKilledByTanks = Math.min(
      defInfantry,
      Math.floor(defInfantryKilledByTanksEff / defMult),
    );
    const defInfRemainingAfterTanksRaw = defInfantry - defInfantryKilledByTanks;
    const defInfRemainingAfterTanksEff = defInfRemainingAfterTanksRaw * defMult;

    const attInfantryTotalEff = deployedInfantry * attMult;
    const attInfantryKilledByTanksEff = Math.min(
      attInfantryTotalEff,
      survivingDefArmorEff * 3,
    );
    const attInfantryKilledByTanks = Math.min(
      deployedInfantry,
      Math.floor(attInfantryKilledByTanksEff / attMult),
    );
    const attInfRemainingAfterTanksRaw =
      deployedInfantry - attInfantryKilledByTanks;
    const attInfRemainingAfterTanksEff = attInfRemainingAfterTanksRaw * attMult;

    const infTradeLossAttEff = Math.min(
      attInfRemainingAfterTanksEff,
      defInfRemainingAfterTanksEff,
    );
    const infTradeLossDefEff = Math.min(
      attInfRemainingAfterTanksEff,
      defInfRemainingAfterTanksEff,
    );

    const attInfTradeLoss = Math.min(
      attInfRemainingAfterTanksRaw,
      Math.ceil(infTradeLossAttEff / attMult),
    );
    const defInfTradeLoss = Math.min(
      defInfRemainingAfterTanksRaw,
      Math.ceil(infTradeLossDefEff / defMult),
    );

    const totalAttInfantryLost = attInfantryKilledByTanks + attInfTradeLoss;
    const totalDefInfantryLost = defInfantryKilledByTanks + defInfTradeLoss;

    const survivingAttInfantry = deployedInfantry - totalAttInfantryLost;
    const survivingDefInfantry = defInfantry - totalDefInfantryLost;

    const initialDefGround = defArmor + defInfantry;
    const totalDefGroundLost = totalDefArmorLost + totalDefInfantryLost;
    const groundLossRatio =
      initialDefGround > 0 ? totalDefGroundLost / initialDefGround : 1.0;

    const isAttackerVictory =
      survivingAttInfantry > 0 &&
      (survivingAttInfantry > survivingDefInfantry ||
        survivingDefInfantry === 0);

    const isFullCapitulation =
      isAttackerVictory && (groundLossRatio >= 0.85 || initialDefGround === 0);

    const finalDefInfantryLost = isFullCapitulation
      ? defInfantry
      : totalDefInfantryLost;
    const finalDefArmorLost = isFullCapitulation ? defArmor : totalDefArmorLost;

    const defenderRemainingAir = Math.max(0, defAirForce - defAirLoss);
    const defenderRemainingAD = Math.max(0, defAirDefense - defAirDefenseLost);
    const defenderRemainingNaval = defender.military.navalFleet || 0;

    const capturedAirForce = isFullCapitulation
      ? Math.floor(defenderRemainingAir * 0.5)
      : 0;
    const capturedAirDefense = isFullCapitulation
      ? Math.floor(defenderRemainingAD * 0.5)
      : 0;
    const capturedNavalFleet = isFullCapitulation
      ? Math.floor(defenderRemainingNaval * 0.5)
      : 0;

    const defenderTotalTerritory = defender.geography.territoryPixelCount || 1;
    const targetRegionPixels =
      targetEnclaveId !== undefined && defender.regionsDemographics
        ? defender.regionsDemographics.find(
            (r) => r.regionId === targetEnclaveId,
          )?.pixelCount || 1000
        : 1000;

    const conqueredPixelsCount = isAttackerVictory
      ? isFullCapitulation
        ? defenderTotalTerritory
        : targetRegionPixels
      : 0;

    const treasuryLootRatio = isAttackerVictory
      ? isFullCapitulation
        ? 0.5
        : Math.min(0.2, targetRegionPixels / defenderTotalTerritory)
      : 0;

    const treasuryLooted = Math.floor(
      Math.max(0, defender.treasury) * treasuryLootRatio,
    );

    let severity: ReportSeverity = "INFO";
    if (isAttackerVictory) {
      severity = isFullCapitulation ? "CRUSHING_VICTORY" : "VICTORY";
    } else {
      severity =
        totalAttInfantryLost > deployedInfantry * 0.5
          ? "CRITICAL_DEFEAT"
          : "DEFEAT";
    }

    const attackerCasualties: CasualtyMetrics = {
      infantryEngaged: deployedInfantry,
      infantryLost: totalAttInfantryLost,
      armorEngaged: deployedArmor,
      armorLost: attArmorLoss,
      airDefenseEngaged: 0,
      airDefenseLost: 0,
      airForceEngaged: deployedAirForce,
      airForceLost: attAirLoss,
      droneMissileEngaged: deployedDrones,
      droneMissileLost: deployedDrones,
      navalFleetEngaged: attacker.military.navalFleet || 0,
      navalFleetLost: 0,
    };

    const defenderCasualties: CasualtyMetrics = {
      infantryEngaged: defInfantry,
      infantryLost: finalDefInfantryLost,
      armorEngaged: defArmor,
      armorLost: finalDefArmorLost,
      airDefenseEngaged: defAirDefense,
      airDefenseLost: defAirDefenseLost,
      airForceEngaged: defAirForce,
      airForceLost: defAirLoss,
      droneMissileEngaged: 0,
      droneMissileLost: 0,
      navalFleetEngaged: defender.military.navalFleet || 0,
      navalFleetLost: 0,
    };

    return {
      isAttackerVictory,
      isFullCapitulation,
      dronesUsed: deployedDrones,
      attackerCasualties,
      defenderCasualties,
      conqueredPixelsCount,
      treasuryLooted,
      deploymentMoneyCost,
      airSupportMultiplier: freeAttAirEff > 0 ? 1.5 : 1.0,
      severity,
      capturedAirForce,
      capturedAirDefense,
      capturedNavalFleet,
    };
  }
}
