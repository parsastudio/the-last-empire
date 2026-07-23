import { TraitManager } from "@/modules/nation/domain/trait-manager";
import { DoctrinesManager } from "@/modules/politics/domain/doctrines-manager";
import { GovernmentSystem } from "@/modules/politics/domain/government-system";
import { CombatContext } from "./combat-context";
import { CombatStage } from "./combat-stage";

export class ScoreFormulationStage implements CombatStage {
  private traitManager = new TraitManager();
  private doctrinesManager = new DoctrinesManager();
  private governmentSystem = new GovernmentSystem();

  public process(context: CombatContext): void {
    const govTraitsDefender = this.governmentSystem.getTraits(
      context.defender.government.type,
    );
    const govTraitsAttacker = this.governmentSystem.getTraits(
      context.attacker.government.type,
    );

    const borderDefenseBonus = this.doctrinesManager.getHomelandDefenseBonus(
      context.defender.doctrines.unlockedDoctrines,
    );

    const defenderHomeBonus =
      1.2 +
      this.traitManager.getCombatDefenseBonus(context.defender) +
      borderDefenseBonus;

    const attackerAttackBonus =
      1.0 + this.traitManager.getCombatAttackBonus(context.attacker);

    const isNeighbor =
      context.attacker.geography.landNeighbors.includes(context.defender.id) ||
      context.attacker.geography.seaNeighbors.includes(context.defender.id);
    const distanceMultiplier = isNeighbor ? 1.0 : 0.85;

    const attackerBase =
      (context.attackForce.infantry * 1.0 +
        context.attackForce.airForce * 3.0 +
        context.attackForce.droneMissile * 2.5) *
      (1 + context.attackForce.techLevel * 0.15) *
      (1 + context.attackForce.experience * 0.005) *
      attackerAttackBonus *
      distanceMultiplier *
      govTraitsAttacker.militaryPowerMultiplier;

    const defenderBase =
      (context.defenderInfantryAfterDrone * 1.0 +
        context.defenderMilitary.airForce * 3.0 +
        context.defenderMilitary.droneMissile * 2.5) *
      (1 + context.defenderMilitary.techLevel * 0.15) *
      (1 + context.defenderMilitary.experience * 0.005) *
      defenderHomeBonus *
      context.defenderDebuffMultiplier *
      govTraitsDefender.militaryPowerMultiplier;

    const rngFactorAttacker = 0.9 + context.prng.nextFloat() * 0.2;
    const rngFactorDefender = 0.9 + context.prng.nextFloat() * 0.2;

    context.attackerScore = Math.floor(attackerBase * rngFactorAttacker);
    context.defenderScore = Math.floor(defenderBase * rngFactorDefender);
    context.attackerWon = context.attackerScore > context.defenderScore;
  }
}
