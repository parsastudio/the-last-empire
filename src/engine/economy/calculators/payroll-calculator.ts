import { Nation } from "@/domain/nation/nation.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";

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

    const calcUnitUpkeep = (
      unitType:
        | "INFANTRY"
        | "ARMOR"
        | "AIR_DEFENSE"
        | "AIR_FORCE"
        | "DRONE_MISSILE"
        | "NAVAL_FLEET",
      count: number,
    ): number => {
      if (!count || count <= 0) return 0;
      const unitPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
        unitType,
        nation.military.techLevel,
        nation.industrialLevel,
      );
      const baseUpkeep = unitPrice * MilitaryPayrollCalculator.PAYROLL_RATE;
      return Math.floor(count * baseUpkeep * doctrineMultiplier);
    };

    const infantry = calcUnitUpkeep("INFANTRY", nation.military.infantry || 0);
    const armor = calcUnitUpkeep("ARMOR", nation.military.armor || 0);
    const airDefense = calcUnitUpkeep(
      "AIR_DEFENSE",
      nation.military.airDefense || 0,
    );
    const airForce = calcUnitUpkeep("AIR_FORCE", nation.military.airForce || 0);
    const droneMissile = calcUnitUpkeep(
      "DRONE_MISSILE",
      nation.military.droneMissile || 0,
    );
    const navalFleet = calcUnitUpkeep(
      "NAVAL_FLEET",
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
