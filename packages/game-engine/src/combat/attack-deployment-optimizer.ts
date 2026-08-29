import {
  Nation,
  Province,
  MILITARY_UNIT_STATS,
  getNationGdp,
  CountryRegistry,
} from "@geopolitics/domain";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";

export interface OptimalDeploymentResult {
  infantry: number;
  armor: number;
  airForce: number;
  drones: number;
  canWin: boolean;
}

export class AttackDeploymentOptimizer {
  public static calculateOptimalDeployment(
    attacker: Nation,
    defender: Nation,
    provincesMap?: Record<string, Province>,
    guarantorNation?: Nation | null,
    attackType: "LAND" | "NAVAL" = "LAND",
    navalFleetCount = 0,
    allNations?: Record<string, Nation>,
  ): OptimalDeploymentResult {
    const maxInf = attacker.military.infantry || 0;
    const maxArmor = attacker.military.armor || 0;
    const maxAir = attacker.military.airForce || 0;
    const maxDrones = attacker.military.droneMissile || 0;

    if (maxInf <= 0) {
      return { infantry: 0, armor: 0, airForce: 0, drones: 0, canWin: false };
    }

    let effectiveGuarantor = guarantorNation;
    if (!effectiveGuarantor && defender.securityGuarantorId && allNations) {
      const gCanonical = CountryRegistry.resolveCanonicalId(
        defender.securityGuarantorId,
      );
      effectiveGuarantor =
        allNations[gCanonical] ||
        allNations[defender.securityGuarantorId] ||
        null;
    }

    const testBattle = (d: number, inf: number, arm: number, af: number) => {
      return BattleCalculator.calculateBattle(
        attacker,
        defender,
        d,
        inf,
        arm,
        af,
        provincesMap,
        effectiveGuarantor,
      );
    };

    const maxNavalCap =
      attackType === "NAVAL" ? Math.max(0, navalFleetCount * 60) : Infinity;

    const clampNaval = (inf: number, arm: number) => {
      let curInf = inf;
      let curArm = arm;
      if (attackType === "NAVAL" && maxNavalCap < Infinity) {
        while (curInf * 1 + curArm * 4 > maxNavalCap) {
          if (curArm > 0 && curArm * 4 >= curInf) {
            curArm = Math.max(0, curArm - 1);
          } else if (curInf > 1) {
            curInf = Math.max(1, curInf - 1);
          } else if (curArm > 0) {
            curArm = Math.max(0, curArm - 1);
          } else {
            break;
          }
        }
      }
      return { inf: curInf, arm: curArm };
    };

    const fullForcesClamped = clampNaval(maxInf, maxArmor);
    const maxSim = testBattle(
      maxDrones,
      fullForcesClamped.inf,
      fullForcesClamped.arm,
      maxAir,
    );

    if (!maxSim.isAttackerVictory) {
      return {
        infantry: fullForcesClamped.inf,
        armor: fullForcesClamped.arm,
        airForce: maxAir,
        drones: maxDrones,
        canWin: false,
      };
    }

    let defAirDefense = defender.military.airDefense || 0;
    let defAirForce = defender.military.airForce || 0;
    let defArmor = defender.military.armor || 0;
    let defInfantry = defender.military.infantry || 0;

    if (
      effectiveGuarantor &&
      effectiveGuarantor.isAlive &&
      effectiveGuarantor.id !== attacker.id
    ) {
      const defGdp = getNationGdp(defender, provincesMap);
      const defenseBudget = Math.floor(defGdp * 0.3);
      defAirForce += Math.floor(
        (defenseBudget * 0.35) / MILITARY_UNIT_STATS.AIR_FORCE.moneyCost,
      );
      defArmor += Math.floor(
        (defenseBudget * 0.3) / MILITARY_UNIT_STATS.ARMOR.moneyCost,
      );
      defAirDefense += Math.floor(
        (defenseBudget * 0.2) / MILITARY_UNIT_STATS.AIR_DEFENSE.moneyCost,
      );
      defInfantry += Math.floor(
        (defenseBudget * 0.15) / MILITARY_UNIT_STATS.INFANTRY.moneyCost,
      );
    }

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

    const neededDrones =
      defAirDefense > 0
        ? Math.ceil(
            (defAirDefense * defAdMult * 4.0) / Math.max(0.1, attDroneMult),
          )
        : 0;
    let drones = Math.min(maxDrones, Math.max(0, neededDrones));

    const neededAir =
      defAirForce > 0 || defArmor > 0
        ? Math.ceil(
            (defAirForce * defAirMult * 1.6 + defArmor * defArmorMult * 0.6) /
              Math.max(0.1, attAirMult),
          ) + 2
        : 0;
    let air = Math.min(maxAir, Math.max(0, neededAir));

    const neededArmor =
      defArmor > 0 || defInfantry > 0
        ? Math.ceil(
            (defArmor * defArmorMult * 1.5 + defInfantry * defInfMult * 0.3) /
              Math.max(0.1, attArmorMult),
          ) + 2
        : 0;
    let armor = Math.min(maxArmor, Math.max(0, neededArmor));

    const neededInf =
      Math.ceil((defInfantry * defInfMult * 1.5) / Math.max(0.1, attInfMult)) +
      5;
    let infantry = Math.max(1, Math.min(maxInf, neededInf));

    const initialClamped = clampNaval(infantry, armor);
    infantry = initialClamped.inf;
    armor = initialClamped.arm;

    let sim = testBattle(drones, infantry, armor, air);

    if (!sim.isAttackerVictory) {
      drones = maxDrones;
      air = maxAir;
      const fullClamped = clampNaval(maxInf, maxArmor);
      infantry = fullClamped.inf;
      armor = fullClamped.arm;
      sim = testBattle(drones, infantry, armor, air);
    }

    const isSafeVictory = (d: number, inf: number, arm: number, af: number) => {
      const result = testBattle(d, inf, arm, af);
      const survivingInfantry =
        result.phase3Ground.attInfantry - result.phase3Ground.attInfantryLost;
      return (
        result.isAttackerVictory &&
        survivingInfantry >= 1 &&
        result.attackerCasualties.infantryLost < inf
      );
    };

    let step = Math.max(1, Math.floor(infantry * 0.1));
    while (step >= 1) {
      while (
        infantry - step >= 1 &&
        isSafeVictory(drones, infantry - step, armor, air)
      ) {
        infantry -= step;
      }
      step = Math.floor(step / 2);
    }

    let armStep = Math.max(1, Math.floor(armor * 0.1));
    while (armStep >= 1) {
      while (
        armor - armStep >= 0 &&
        isSafeVictory(drones, infantry, armor - armStep, air)
      ) {
        armor -= armStep;
      }
      armStep = Math.floor(armStep / 2);
    }

    let airStep = Math.max(1, Math.floor(air * 0.1));
    while (airStep >= 1) {
      while (
        air - airStep >= 0 &&
        isSafeVictory(drones, infantry, armor, air - airStep)
      ) {
        air -= airStep;
      }
      airStep = Math.floor(airStep / 2);
    }

    let droneStep = Math.max(1, Math.floor(drones * 0.1));
    while (droneStep >= 1) {
      while (
        drones - droneStep >= 0 &&
        isSafeVictory(drones - droneStep, infantry, armor, air)
      ) {
        drones -= droneStep;
      }
      droneStep = Math.floor(droneStep / 2);
    }

    const finalValidation = testBattle(drones, infantry, armor, air);
    if (!finalValidation.isAttackerVictory) {
      drones = Math.min(maxDrones, drones + 2);
      air = Math.min(maxAir, air + 2);
      armor = Math.min(maxArmor, armor + 2);
      infantry = Math.min(maxInf, infantry + 5);
      const finalClamped = clampNaval(infantry, armor);
      infantry = finalClamped.inf;
      armor = finalClamped.arm;
    }

    return {
      infantry: Math.max(1, infantry),
      armor,
      airForce: air,
      drones,
      canWin: true,
    };
  }
}
