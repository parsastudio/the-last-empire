import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export class CombatModifierResolver {
  public static calculateDeploymentCosts(
    forceCost: number,
    attackType?: "LAND" | "NAVAL",
    navalCostMultiplier?: number,
  ): {
    moneyCost: number;
  } {
    if (attackType === "NAVAL" && navalCostMultiplier !== undefined) {
      return { moneyCost: Math.floor(forceCost * navalCostMultiplier) };
    }
    const deploymentFivePct = forceCost * 0.05;
    const moneyCost = Math.floor(deploymentFivePct);
    return { moneyCost };
  }

  public static getCombatPowerModifiers(
    attacker: Nation,
    defender: Nation,
  ): { attackerGovMult: number; defenderGovMult: number } {
    const attackerGovTraits = GovernmentSystem.getTraits(
      attacker.government.type,
    );
    const defenderGovTraits = GovernmentSystem.getTraits(
      defender.government.type,
    );

    const attackerGovMult = attackerGovTraits.militaryPowerMultiplier;
    const defenderGovMult = defenderGovTraits.militaryPowerMultiplier;

    return { attackerGovMult, defenderGovMult };
  }

  public static getDroneStrikeEffectiveness(
    attacker: Nation,
    defender: Nation,
    dronesUsed: number,
    attackerGovMult: number,
  ): number {
    const techMultiplier = 1 + (attacker.military.techLevel - 1) * 0.5;
    const droneMult = DoctrinesManager.getDronePowerMultiplier(
      attacker.doctrines?.unlockedDoctrines,
    );

    let droneCasualties = Math.floor(
      dronesUsed * 3 * techMultiplier * attackerGovMult * droneMult,
    );

    const defenderAirDefenseRate =
      DoctrinesManager.getAirDefenseInterceptionRate(
        defender.doctrines?.unlockedDoctrines,
      );
    if (defenderAirDefenseRate > 0) {
      droneCasualties = Math.floor(
        droneCasualties * (1.0 - defenderAirDefenseRate),
      );
    }

    return droneCasualties;
  }
}
