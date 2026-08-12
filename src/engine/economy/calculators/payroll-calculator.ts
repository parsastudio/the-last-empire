import { Nation } from "@/domain/nation/nation.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export interface BreakdownMilitaryPayroll {
  infantry: number;
  airForce: number;
  droneMissile: number;
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
      nation.military.infantry,
    );
    const airForce = calculateUnitUpkeep(
      MILITARY_UNIT_STATS.AIR_FORCE.moneyCost,
      nation.military.airForce,
    );
    const droneMissile = calculateUnitUpkeep(
      MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost,
      nation.military.droneMissile,
    );

    return {
      infantry,
      airForce,
      droneMissile,
      total: infantry + airForce + droneMissile,
    };
  }
}
