import {
  Nation,
  Province,
  MILITARY_UNIT_STATS,
  getNationGdp,
} from "@geopolitics/domain";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";

export interface OptimalDeploymentResult {
  infantry: number;
  armor: number;
  airForce: number;
  drones: number;
}

export class AttackDeploymentOptimizer {
  public static calculateOptimalDeployment(
    attacker: Nation,
    defender: Nation,
    provincesMap?: Record<string, Province>,
    guarantorNation?: Nation | null,
    attackType: "LAND" | "NAVAL" = "LAND",
    navalFleetCount = 0,
  ): OptimalDeploymentResult {
    const maxInf = attacker.military.infantry || 0;
    const maxArmor = attacker.military.armor || 0;
    const maxAir = attacker.military.airForce || 0;
    const maxDrones = attacker.military.droneMissile || 0;

    if (maxInf <= 0) {
      return { infantry: 0, armor: 0, airForce: 0, drones: 0 };
    }

    let defAirDefense = defender.military.airDefense || 0;
    let defAirForce = defender.military.airForce || 0;
    let defArmor = defender.military.armor || 0;
    let defInfantry = defender.military.infantry || 0;

    if (
      guarantorNation &&
      guarantorNation.isAlive &&
      guarantorNation.id !== attacker.id
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
            (defAirDefense * defAdMult * 2.5) / Math.max(0.1, attDroneMult),
          )
        : 0;
    let drones = Math.min(maxDrones, Math.max(0, neededDrones));

    const neededAir =
      defAirForce > 0 || defAirDefense > 0
        ? Math.ceil(
            (defAirForce * defAirMult * 1.5 + defAirDefense * defAdMult * 0.6) /
              Math.max(0.1, attAirMult),
          ) + 3
        : 0;
    let air = Math.min(maxAir, Math.max(0, neededAir));

    const neededArmor =
      defArmor > 0
        ? Math.ceil(
            (defArmor * defArmorMult * 1.45) / Math.max(0.1, attArmorMult),
          ) + 3
        : 0;
    let armor = Math.min(maxArmor, Math.max(0, neededArmor));

    const neededInf =
      Math.ceil((defInfantry * defInfMult * 1.45) / Math.max(0.1, attInfMult)) +
      5;
    let infantry = Math.max(1, Math.min(maxInf, neededInf));

    const maxNavalCap =
      attackType === "NAVAL" ? navalFleetCount * 60 : Infinity;

    if (attackType === "NAVAL" && maxNavalCap > 0) {
      while (infantry * 1 + armor * 4 > maxNavalCap) {
        if (armor > 0 && armor * 4 > infantry) {
          armor = Math.max(0, armor - 1);
        } else if (infantry > 1) {
          infantry = Math.max(1, infantry - 1);
        } else {
          armor = Math.max(0, armor - 1);
          break;
        }
      }
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
        guarantorNation,
      );
    };

    let sim = testBattle(drones, infantry, armor, air);

    if (!sim.isAttackerVictory) {
      if (drones < maxDrones && defAirDefense > 0) {
        drones = maxDrones;
        sim = testBattle(drones, infantry, armor, air);
      }
      if (!sim.isAttackerVictory && air < maxAir) {
        air = maxAir;
        sim = testBattle(drones, infantry, armor, air);
      }
      if (!sim.isAttackerVictory && armor < maxArmor) {
        const remainingCap =
          attackType === "NAVAL"
            ? Math.max(0, Math.floor((maxNavalCap - infantry) / 4))
            : maxArmor;
        armor = Math.min(maxArmor, remainingCap);
        sim = testBattle(drones, infantry, armor, air);
      }
      if (!sim.isAttackerVictory && infantry < maxInf) {
        const remainingCap =
          attackType === "NAVAL"
            ? Math.max(1, maxNavalCap - armor * 4)
            : maxInf;
        infantry = Math.max(1, Math.min(maxInf, remainingCap));
        sim = testBattle(drones, infantry, armor, air);
      }

      if (!sim.isAttackerVictory && attackType === "NAVAL") {
        for (
          let testArmor = Math.min(maxArmor, Math.floor(maxNavalCap / 4));
          testArmor >= 0;
          testArmor--
        ) {
          const testInf = Math.min(
            maxInf,
            Math.max(1, maxNavalCap - testArmor * 4),
          );
          const testSim = testBattle(drones, testInf, testArmor, air);
          if (testSim.isAttackerVictory) {
            armor = testArmor;
            infantry = testInf;
            sim = testSim;
            break;
          }
        }
      }
    }

    if (sim.isAttackerVictory) {
      const step = Math.max(1, Math.floor(infantry * 0.1));
      while (infantry - step >= 1) {
        const nextInf = infantry - step;
        const testSim = testBattle(drones, nextInf, armor, air);
        if (
          testSim.isAttackerVictory &&
          testSim.phase3Ground.attInfantryLost < nextInf
        ) {
          infantry = nextInf;
        } else {
          break;
        }
      }

      if (armor > 0) {
        const armStep = Math.max(1, Math.floor(armor * 0.1));
        while (armor - armStep >= 0) {
          const nextArm = armor - armStep;
          const testSim = testBattle(drones, infantry, nextArm, air);
          if (
            testSim.isAttackerVictory &&
            testSim.phase3Ground.attInfantryLost < infantry
          ) {
            armor = nextArm;
          } else {
            break;
          }
        }
      }

      if (air > 0) {
        const airStep = Math.max(1, Math.floor(air * 0.1));
        while (air - airStep >= 0) {
          const nextAir = air - airStep;
          const testSim = testBattle(drones, infantry, armor, nextAir);
          if (
            testSim.isAttackerVictory &&
            testSim.phase3Ground.attInfantryLost < infantry
          ) {
            air = nextAir;
          } else {
            break;
          }
        }
      }

      if (drones > 0) {
        const droneStep = Math.max(1, Math.floor(drones * 0.1));
        while (drones - droneStep >= 0) {
          const nextDrone = drones - droneStep;
          const testSim = testBattle(nextDrone, infantry, armor, air);
          if (
            testSim.isAttackerVictory &&
            testSim.phase3Ground.attInfantryLost < infantry
          ) {
            drones = nextDrone;
          } else {
            break;
          }
        }
      }
    }

    return {
      infantry: Math.max(1, infantry),
      armor,
      airForce: air,
      drones,
    };
  }
}
