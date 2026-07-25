import { DroneStrikeCalculator } from "@/engine/combat/drone-strike-calculator";
import { CombatContext } from "@/engine/combat/stages/combat-context";
import { CombatStage } from "@/engine/combat/stages/combat-stage";

export class DroneStrikeStage implements CombatStage {
  private droneCalc = new DroneStrikeCalculator();

  public process(context: CombatContext): void {
    const droneResult = this.droneCalc.calculateDroneImpact(
      context.attackForce,
      context.defenderMilitary,
      context.attacker.doctrines.unlockedDoctrines,
    );
    context.defenderInfantryAfterDrone = droneResult.remainingDefenderInfantry;
    context.attackForce.droneMissile = Math.max(
      0,
      context.attackForce.droneMissile - droneResult.attackerDronesDestroyed,
    );
    context.defenderMilitary.droneMissile = Math.max(
      0,
      context.defenderMilitary.droneMissile -
        droneResult.defenderDronesDestroyed,
    );
  }
}
