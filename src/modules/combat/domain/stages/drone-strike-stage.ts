import { DroneStrikeCalculator } from "../drone-strike-calculator";
import { CombatContext } from "./combat-context";
import { CombatStage } from "./combat-stage";

export class DroneStrikeStage implements CombatStage {
  private droneCalc = new DroneStrikeCalculator();

  public process(context: CombatContext): void {
    const droneResult = this.droneCalc.calculateDroneImpact(
      context.attackForce,
      context.defenderMilitary,
    );
    context.defenderInfantryAfterDrone = droneResult.remainingDefenderInfantry;
  }
}
