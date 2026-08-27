import { Nation } from "@/domain/nation/nation.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

export class MilitaryPowerCalculator {
  public static calculateLandAndAirPower(nation: Nation): number {
    const infantry = nation.military.infantry || 0;
    const armor = nation.military.armor || 0;
    const airDefense = nation.military.airDefense || 0;
    const airForce = nation.military.airForce || 0;
    const droneMissile = nation.military.droneMissile || 0;

    const infTech = MilitaryInventoryHelper.getBranchTech(
      nation.military,
      "INFANTRY",
    );
    const armTech = MilitaryInventoryHelper.getBranchTech(
      nation.military,
      "ARMOR",
    );
    const adTech = MilitaryInventoryHelper.getBranchTech(
      nation.military,
      "AIR_DEFENSE",
    );
    const afTech = MilitaryInventoryHelper.getBranchTech(
      nation.military,
      "AIR_FORCE",
    );
    const drTech = MilitaryInventoryHelper.getBranchTech(
      nation.military,
      "DRONE_MISSILE",
    );

    const infMult = 1 + (infTech - 1) * 0.5;
    const armMult = 1 + (armTech - 1) * 0.5;
    const adMult = 1 + (adTech - 1) * 0.5;
    const afMult = 1 + (afTech - 1) * 0.5;
    const drMult = 1 + (drTech - 1) * 0.5;

    const rawPower =
      infantry * MILITARY_UNIT_STATS.INFANTRY.weightPower * infMult +
      armor * MILITARY_UNIT_STATS.ARMOR.weightPower * armMult +
      airDefense * MILITARY_UNIT_STATS.AIR_DEFENSE.weightPower * adMult +
      airForce * MILITARY_UNIT_STATS.AIR_FORCE.weightPower * afMult +
      droneMissile * MILITARY_UNIT_STATS.DRONE_MISSILE.weightPower * drMult;

    return Math.floor(rawPower);
  }

  public static calculateEffectivePower(nation: Nation): number {
    return this.calculateLandAndAirPower(nation);
  }
}
