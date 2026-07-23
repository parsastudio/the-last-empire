import { CasualtyCalculator } from "../casualty-calculator";
import { ExperienceManager } from "@/modules/military/domain/experience-manager";
import { CombatContext } from "./combat-context";
import { CombatStage } from "./combat-stage";

export class CasualtyStage implements CombatStage {
  private casualtyCalc = new CasualtyCalculator();
  private experienceManager = new ExperienceManager();

  public process(context: CombatContext): void {
    const casualties = this.casualtyCalc.calculateCasualties(
      context.attackerScore,
      context.defenderScore,
      context.attackForce,
      context.defenderMilitary,
      context.attackerWon,
    );

    context.attackForce.infantry = Math.max(
      0,
      context.attackForce.infantry - casualties.attackerKilledInfantry,
    );
    context.attackForce.airForce = Math.max(
      0,
      context.attackForce.airForce - casualties.attackerKilledAirForce,
    );
    context.attackForce.droneMissile = Math.max(
      0,
      context.attackForce.droneMissile - casualties.attackerKilledDrones,
    );

    context.defenderMilitary.infantry = Math.max(
      0,
      context.defenderInfantryAfterDrone - casualties.defenderKilledInfantry,
    );
    context.defenderMilitary.airForce = Math.max(
      0,
      context.defenderMilitary.airForce - casualties.defenderKilledAirForce,
    );
    context.defenderMilitary.droneMissile = Math.max(
      0,
      context.defenderMilitary.droneMissile - casualties.defenderKilledDrones,
    );

    context.attackForce = this.experienceManager.addExperience(
      context.attackForce,
      context.attackerWon ? 5 : 2,
    );
    context.defenderMilitary = this.experienceManager.addExperience(
      context.defenderMilitary,
      context.attackerWon ? 2 : 5,
    );
  }
}
