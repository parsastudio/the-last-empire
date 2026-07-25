import { Nation } from "@/domain/nation/nation.schema";

export class BattleRulesEvaluator {
  public evaluateCombatPowerModifier(
    attacker: Nation,
    defender: Nation,
  ): number {
    let modifier = 1.0;

    if (attacker.military.techLevel > defender.military.techLevel) {
      modifier += 0.15;
    } else if (attacker.military.techLevel < defender.military.techLevel) {
      modifier -= 0.15;
    }

    if (defender.government.stability < 30) {
      modifier += 0.1;
    }

    return Math.max(0.5, modifier);
  }
}
