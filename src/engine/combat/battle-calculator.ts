import { Nation } from "@/domain/nation/nation.schema";
import {
  CasualtyMetrics,
  ReportSeverity,
} from "@/domain/reports/combat-report.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export interface BattleCalculationResult {
  isAttackerVictory: boolean;
  isFullCapitulation: boolean;
  valuationRatio: number;
  dronesUsed: number;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  conqueredPixelsCount: number;
  treasuryLooted: number;
  deploymentMoneyCost: number;
  airSupportMultiplier: number;
  severity: ReportSeverity;
  capturedInfantry: number;
  capturedArmor: number;
  capturedAirDefense: number;
  capturedAirForce: number;
  capturedDrones: number;
  capturedNavalFleet: number;
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

    const attMult = CombatModifierResolver.getEffectiveMultiplier(attacker);
    const defMult = CombatModifierResolver.getEffectiveMultiplier(defender);

    const attackerDroneBonus = DoctrinesManager.getDronePowerMultiplier(
      attacker.doctrines?.unlockedDoctrines,
    );
    const defenderInterceptionBonus =
      DoctrinesManager.getAirDefenseInterceptionRate(
        defender.doctrines?.unlockedDoctrines,
      );
    const attackerPrecisionBonus =
      DoctrinesManager.getPrecisionMissileDirectDamage(
        attacker.doctrines?.unlockedDoctrines,
      );
    const defenderEwBonus = DoctrinesManager.getElectronicWarfareEvasion(
      defender.doctrines?.unlockedDoctrines,
    );

    const defAirDefense = defender.military.airDefense || 0;
    const defAirForce = defender.military.airForce || 0;
    const defArmor = defender.military.armor || 0;
    const defInfantry = defender.military.infantry || 0;

    const attMissilesEff = deployedDrones * attMult * attackerDroneBonus;
    const defAirDefenseEff =
      defAirDefense * defMult * (1 + defenderInterceptionBonus);

    const missilesInterceptedEff = Math.min(
      attMissilesEff,
      defAirDefenseEff * 2,
    );
    const missilesLeakedEff = Math.max(
      0,
      attMissilesEff - missilesInterceptedEff,
    );

    const airDefenseDestroyedEff = Math.floor(
      missilesLeakedEff * (0.5 + attackerPrecisionBonus),
    );
    const rawDefAirDefenseLost = Math.min(
      defAirDefense,
      Math.floor(airDefenseDestroyedEff / defMult),
    );
    const defAirDefenseRemainingRaw = defAirDefense - rawDefAirDefenseLost;
    const defAirDefenseRemainingEff = defAirDefenseRemainingRaw * defMult;

    const attAirEff =
      deployedAirForce * attMult * (defenderEwBonus ? 0.8 : 1.0);
    const defAirEff = defAirForce * defMult;

    const dogfightLossAttEff = Math.min(attAirEff, defAirEff);
    const dogfightLossDefEff = Math.min(attAirEff, defAirEff);

    const rawAttAirLoss = Math.min(
      deployedAirForce,
      Math.ceil(dogfightLossAttEff / attMult),
    );
    const rawDefAirLoss = Math.min(
      defAirForce,
      Math.ceil(dogfightLossDefEff / defMult),
    );

    const survivingAttAirRaw = deployedAirForce - rawAttAirLoss;
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

    const rawAttArmorLoss = Math.min(
      deployedArmor,
      Math.ceil(tankTradeLossAttEff / attMult),
    );
    const defArmorLossGround = Math.min(
      defArmorAfterAirRaw,
      Math.ceil(tankTradeLossDefEff / defMult),
    );
    const rawDefArmorLost = defArmorDestroyedByAir + defArmorLossGround;

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

    const rawAttInfantryLost = attInfantryKilledByTanks + attInfTradeLoss;
    const rawDefInfantryLost = defInfantryKilledByTanks + defInfTradeLoss;

    const survivingAttInfantryRaw = deployedInfantry - rawAttInfantryLost;
    const survivingDefInfantryRaw = defInfantry - rawDefInfantryLost;

    const isAttackerVictory =
      survivingAttInfantryRaw > 0 &&
      (survivingAttInfantryRaw > survivingDefInfantryRaw ||
        survivingDefInfantryRaw === 0);

    const attInfRecovered = Math.floor(rawAttInfantryLost * 0.25);
    const attArmorRecovered = Math.floor(rawAttArmorLoss * 0.25);
    const attAirRecovered = Math.floor(rawAttAirLoss * 0.25);

    const defInfRecovered = Math.floor(rawDefInfantryLost * 0.25);
    const defArmorRecovered = Math.floor(rawDefArmorLost * 0.25);
    const defAirDefenseRecovered = Math.floor(rawDefAirDefenseLost * 0.25);
    const defAirRecovered = Math.floor(rawDefAirLoss * 0.25);

    const netAttInfantryLost = rawAttInfantryLost - attInfRecovered;
    const netAttArmorLost = rawAttArmorLoss - attArmorRecovered;
    const netAttAirLost = rawAttAirLoss - attAirRecovered;

    const netDefInfantryLost = rawDefInfantryLost - defInfRecovered;
    const netDefArmorLost = rawDefArmorLost - defArmorRecovered;
    const netDefAirDefenseLost = rawDefAirDefenseLost - defAirDefenseRecovered;
    const netDefAirLost = rawDefAirLoss - defAirRecovered;

    const attackerDeployedValuation =
      MilitaryPricingCalculator.calculateLandAndAirValuation(
        {
          infantry: deployedInfantry,
          armor: deployedArmor,
          airDefense: 0,
          airForce: deployedAirForce,
          droneMissile: deployedDrones,
          techLevel: attacker.military.techLevel,
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
        },
        defender.industrialLevel,
      );

    const valuationRatio =
      defenderTotalValuation <= 0
        ? 999
        : Number(
            (attackerDeployedValuation / defenderTotalValuation).toFixed(2),
          );

    const isFullCapitulation = isAttackerVictory && valuationRatio >= 4.0;

    const defenderRemainingInfantry = Math.max(
      0,
      defInfantry - netDefInfantryLost,
    );
    const defenderRemainingArmor = Math.max(0, defArmor - netDefArmorLost);
    const defenderRemainingAD = Math.max(
      0,
      defAirDefense - netDefAirDefenseLost,
    );
    const defenderRemainingAir = Math.max(0, defAirForce - netDefAirLost);
    const defenderRemainingDrones = defender.military.droneMissile || 0;
    const defenderRemainingNaval = defender.military.navalFleet || 0;

    const capturedInfantry = isFullCapitulation ? defenderRemainingInfantry : 0;
    const capturedArmor = isFullCapitulation ? defenderRemainingArmor : 0;
    const capturedAirDefense = isFullCapitulation ? defenderRemainingAD : 0;
    const capturedAirForce = isFullCapitulation ? defenderRemainingAir : 0;
    const capturedDrones = isFullCapitulation ? defenderRemainingDrones : 0;
    const capturedNavalFleet = isFullCapitulation ? defenderRemainingNaval : 0;

    const defenderTotalTerritory = defender.geography.territoryPixelCount || 1;
    const targetRegionPixels = 1000;

    const conqueredPixelsCount = isAttackerVictory
      ? isFullCapitulation
        ? defenderTotalTerritory
        : targetRegionPixels
      : 0;

    const treasuryLootRatio = isAttackerVictory
      ? isFullCapitulation
        ? 1.0
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
        netAttInfantryLost > deployedInfantry * 0.5
          ? "CRITICAL_DEFEAT"
          : "DEFEAT";
    }

    const attackerCasualties: CasualtyMetrics = {
      infantryEngaged: deployedInfantry,
      infantryLost: netAttInfantryLost,
      armorEngaged: deployedArmor,
      armorLost: netAttArmorLost,
      airDefenseEngaged: 0,
      airDefenseLost: 0,
      airForceEngaged: deployedAirForce,
      airForceLost: netAttAirLost,
      droneMissileEngaged: deployedDrones,
      droneMissileLost: deployedDrones,
      navalFleetEngaged: attacker.military.navalFleet || 0,
      navalFleetLost: 0,
    };

    const defenderCasualties: CasualtyMetrics = {
      infantryEngaged: defInfantry,
      infantryLost: isFullCapitulation ? defInfantry : netDefInfantryLost,
      armorEngaged: defArmor,
      armorLost: isFullCapitulation ? defArmor : netDefArmorLost,
      airDefenseEngaged: defAirDefense,
      airDefenseLost: isFullCapitulation ? defAirDefense : netDefAirDefenseLost,
      airForceEngaged: defAirForce,
      airForceLost: isFullCapitulation ? defAirForce : netDefAirLost,
      droneMissileEngaged: 0,
      droneMissileLost: 0,
      navalFleetEngaged: defender.military.navalFleet || 0,
      navalFleetLost: 0,
    };

    return {
      isAttackerVictory,
      isFullCapitulation,
      valuationRatio,
      dronesUsed: deployedDrones,
      attackerCasualties,
      defenderCasualties,
      conqueredPixelsCount,
      treasuryLooted,
      deploymentMoneyCost,
      airSupportMultiplier: freeAttAirEff > 0 ? 1.5 : 1.0,
      severity,
      capturedInfantry,
      capturedArmor,
      capturedAirDefense,
      capturedAirForce,
      capturedDrones,
      capturedNavalFleet,
    };
  }
}
