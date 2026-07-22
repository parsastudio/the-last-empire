import { CasualtyCalculator } from "../casualty-calculator";
import { CombatContext } from "./combat-context";
import { CombatStage } from "./combat-stage";

export class CasualtyStage implements CombatStage {
  private casualtyCalc = new CasualtyCalculator();

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

    context.defenderMilitary.infantry = Math.max(
      0,
      context.defenderInfantryAfterDrone - casualties.defenderKilledInfantry,
    );
    context.defenderMilitary.airForce = Math.max(
      0,
      context.defenderMilitary.airForce - casualties.defenderKilledAirForce,
    );
  }
}
