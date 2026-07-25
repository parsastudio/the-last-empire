import { AirSuperiorityCalculator } from "@/engine/combat/air-superiority";
import { CombatContext } from "@/engine/combat/stages/combat-context";
import { CombatStage } from "@/engine/combat/stages/combat-stage";

export class AirSuperiorityStage implements CombatStage {
  private airCalc = new AirSuperiorityCalculator();

  public process(context: CombatContext): void {
    const airResult = this.airCalc.evaluateAirSuperiority(
      context.attackForce,
      context.defenderMilitary,
    );
    context.defenderDebuffMultiplier = 1.0 - airResult.defenderDefenseDebuff;
  }
}
