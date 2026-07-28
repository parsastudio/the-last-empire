import { AttackAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";

export class AttackPowerCalculator {
  public calculateAttackerPower(
    action: AttackAction,
    supplyMultiplier: number,
  ): number {
    const basePower =
      action.infantry * 1.0 + action.airForce * 3.0 + action.droneMissile * 2.5;
    return Math.floor(basePower * supplyMultiplier);
  }

  public calculateDefenderPower(defender: Nation): number {
    return (
      defender.military.infantry * 1.0 +
      defender.military.airForce * 3.0 +
      defender.military.droneMissile * 2.5
    );
  }
}
