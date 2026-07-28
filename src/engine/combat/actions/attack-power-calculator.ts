import { AttackAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";

export class AttackPowerCalculator {
  private governmentSystem = new GovernmentSystem();

  public calculateAttackerPower(
    action: AttackAction,
    supplyMultiplier: number,
    attacker?: Nation,
  ): number {
    const basePower =
      action.infantry * 1.0 + action.airForce * 3.0 + action.droneMissile * 2.5;

    let techMultiplier = 1.0;
    let expMultiplier = 1.0;
    let govMultiplier = 1.0;

    if (attacker) {
      techMultiplier = 1.0 + (attacker.military.techLevel - 1) * 0.2;
      expMultiplier = 1.0 + (attacker.military.experience / 100) * 0.3;
      const govTraits = this.governmentSystem.getTraits(
        attacker.government.type,
      );
      govMultiplier = govTraits.militaryPowerMultiplier;
    }

    return Math.floor(
      basePower *
        techMultiplier *
        expMultiplier *
        govMultiplier *
        supplyMultiplier,
    );
  }

  public calculateDefenderPower(defender: Nation): number {
    const basePower =
      defender.military.infantry * 1.0 +
      defender.military.airForce * 3.0 +
      defender.military.droneMissile * 2.5;

    const techMultiplier = 1.0 + (defender.military.techLevel - 1) * 0.2;
    const expMultiplier = 1.0 + (defender.military.experience / 100) * 0.3;
    const govTraits = this.governmentSystem.getTraits(defender.government.type);

    return Math.floor(
      basePower *
        techMultiplier *
        expMultiplier *
        govTraits.militaryPowerMultiplier,
    );
  }
}
