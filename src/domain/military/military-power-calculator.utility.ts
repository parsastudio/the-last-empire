import { Nation } from "@/domain/nation/nation.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export class MilitaryPowerCalculator {
  public static calculateEffectivePower(nation: Nation): number {
    const infantry = nation.military.infantry || 0;
    const armor = nation.military.armor || 0;
    const airDefense = nation.military.airDefense || 0;
    const airForce = nation.military.airForce || 0;
    const droneMissile = nation.military.droneMissile || 0;
    const navalFleet = nation.military.navalFleet || 0;

    const rawPower =
      infantry * MILITARY_UNIT_STATS.INFANTRY.weightPower +
      armor * MILITARY_UNIT_STATS.ARMOR.weightPower +
      airDefense * MILITARY_UNIT_STATS.AIR_DEFENSE.weightPower +
      airForce * MILITARY_UNIT_STATS.AIR_FORCE.weightPower +
      droneMissile * MILITARY_UNIT_STATS.DRONE_MISSILE.weightPower +
      navalFleet * MILITARY_UNIT_STATS.NAVAL_FLEET.weightPower;

    const techLevel = Math.max(1, nation.military.techLevel || 1);
    const techMult = 1 + (techLevel - 1) * 0.5;
    const govType = nation.government?.type;
    const govMult =
      govType === "FASCISM" || govType === "DICTATORSHIP" ? 1.2 : 1.0;

    return Math.floor(rawPower * techMult * govMult);
  }
}
