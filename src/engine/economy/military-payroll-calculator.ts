import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { TraitManager } from "@/engine/politics/trait-manager";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export interface BreakdownMilitaryPayroll {
  infantry: number;
  airForce: number;
  droneMissile: number;
  total: number;
}

export class MilitaryPayrollCalculator {
  public static calculatePayroll(nation: Nation): BreakdownMilitaryPayroll {
    const traitMultiplier = TraitManager.getMilitaryPayrollMultiplier(nation);
    const govTraits = GovernmentSystem.getTraits(nation.government.type);
    const doctrineMultiplier = DoctrinesManager.getMilitaryPayrollMultiplier(
      nation.doctrines?.unlockedDoctrines,
    );

    const techMultiplier = 1 + (nation.military.techLevel - 1) * 0.2;
    const combinedMultiplier =
      techMultiplier *
      traitMultiplier *
      govTraits.militaryPayrollMultiplier *
      doctrineMultiplier;

    const infantry = Math.floor(
      nation.military.infantry *
        MILITARY_UNIT_STATS.INFANTRY.moneyPayrollBase *
        combinedMultiplier *
        1000000,
    );

    const airForce = Math.floor(
      nation.military.airForce *
        MILITARY_UNIT_STATS.AIR_FORCE.moneyPayrollBase *
        combinedMultiplier *
        1000000,
    );

    const droneMissile = Math.floor(
      nation.military.droneMissile *
        MILITARY_UNIT_STATS.DRONE_MISSILE.moneyPayrollBase *
        combinedMultiplier *
        1000000,
    );

    const total = infantry + airForce + droneMissile;

    return {
      infantry,
      airForce,
      droneMissile,
      total,
    };
  }
}
