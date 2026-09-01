import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { UnitType, MilitaryStack } from "@/domain/military/military.schema";

export interface MilitaryPowerTarget {
  military: MilitaryStack;
}

export class MilitaryPowerCalculator {
  public static readonly POWER_GROWTH_BASE = 2.2;

  public static calculateTechMultiplier(techLevel: number): number {
    const safeTech = Math.max(1.0, techLevel || 1.0);
    return Math.pow(this.POWER_GROWTH_BASE, safeTech - 1.0);
  }

  public static calculateUnitTypePower(
    unitType: UnitType,
    techLevel: number,
  ): number {
    const stat = MILITARY_UNIT_STATS[unitType];
    const techMultiplier = this.calculateTechMultiplier(techLevel);
    return stat.weightPower * techMultiplier;
  }

  public static calculateLandAndAirPower(target: MilitaryPowerTarget): number {
    const infantry = target.military.infantry || 0;
    const armor = target.military.armor || 0;
    const airDefense = target.military.airDefense || 0;
    const airForce = target.military.airForce || 0;
    const droneMissile = target.military.droneMissile || 0;

    const infTech = MilitaryInventoryHelper.getBranchTech(
      target.military,
      "INFANTRY",
    );
    const armTech = MilitaryInventoryHelper.getBranchTech(
      target.military,
      "ARMOR",
    );
    const adTech = MilitaryInventoryHelper.getBranchTech(
      target.military,
      "AIR_DEFENSE",
    );
    const afTech = MilitaryInventoryHelper.getBranchTech(
      target.military,
      "AIR_FORCE",
    );
    const drTech = MilitaryInventoryHelper.getBranchTech(
      target.military,
      "DRONE_MISSILE",
    );

    const infMult = this.calculateTechMultiplier(infTech);
    const armMult = this.calculateTechMultiplier(armTech);
    const adMult = this.calculateTechMultiplier(adTech);
    const afMult = this.calculateTechMultiplier(afTech);
    const drMult = this.calculateTechMultiplier(drTech);

    const rawPower =
      infantry * MILITARY_UNIT_STATS.INFANTRY.weightPower * infMult +
      armor * MILITARY_UNIT_STATS.ARMOR.weightPower * armMult +
      airDefense * MILITARY_UNIT_STATS.AIR_DEFENSE.weightPower * adMult +
      airForce * MILITARY_UNIT_STATS.AIR_FORCE.weightPower * afMult +
      droneMissile * MILITARY_UNIT_STATS.DRONE_MISSILE.weightPower * drMult;

    return Math.floor(rawPower);
  }
}
