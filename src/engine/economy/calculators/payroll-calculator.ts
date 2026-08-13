import { Nation } from "@/domain/nation/nation.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export interface BreakdownMilitaryPayroll {
  infantry: number;
  armor: number;
  airDefense: number;
  airForce: number;
  droneMissile: number;
  navalFleet: number;
  total: number;
}

export class MilitaryPayrollCalculator {
  public static readonly PAYROLL_RATE = 0.05;

  public static calculatePayroll(nation: Nation): BreakdownMilitaryPayroll {
    const doctrineMultiplier = DoctrinesManager.getMilitaryPayrollMultiplier(
      nation.doctrines?.unlockedDoctrines,
    );
    const techMultiplier = 1 + (nation.military.techLevel - 1) * 0.05;

    const calculateUnitUpkeep = (baseCost: number, count: number): number => {
      const unitValue = baseCost * techMultiplier;
      const baseUpkeep = unitValue * MilitaryPayrollCalculator.PAYROLL_RATE;
      return Math.floor(count * baseUpkeep * doctrineMultiplier);
    };

    const infantry = calculateUnitUpkeep(
      MILITARY_UNIT_STATS.INFANTRY.moneyCost,
      nation.military.infantry || 0,
    );
    const armor = calculateUnitUpkeep(
      MILITARY_UNIT_STATS.ARMOR.moneyCost,
      nation.military.armor || 0,
    );
    const airDefense = calculateUnitUpkeep(
      MILITARY_UNIT_STATS.AIR_DEFENSE.moneyCost,
      nation.military.airDefense || 0,
    );
    const airForce = calculateUnitUpkeep(
      MILITARY_UNIT_STATS.AIR_FORCE.moneyCost,
      nation.military.airForce || 0,
    );
    const droneMissile = calculateUnitUpkeep(
      MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost,
      nation.military.droneMissile || 0,
    );
    const navalFleet = calculateUnitUpkeep(
      MILITARY_UNIT_STATS.NAVAL_FLEET.moneyCost,
      nation.military.navalFleet || 0,
    );

    const total =
      infantry + armor + airDefense + airForce + droneMissile + navalFleet;

    return {
      infantry,
      armor,
      airDefense,
      airForce,
      droneMissile,
      navalFleet,
      total,
    };
  }
}
