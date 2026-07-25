import { TraitManager } from "@/engine/politics/trait-manager";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { CombatContext } from "@/engine/combat/stages/combat-context";
import { CombatStage } from "@/engine/combat/stages/combat-stage";

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

    const attackerOilRequired = Math.ceil(context.attackForce.airForce * 0.5);
    const attackerHasOil =
      context.attacker.resources.oil >= attackerOilRequired;
    const attackerOilPenalty = attackerHasOil ? 1.0 : 0.3;

    const defenderOilRequired = Math.ceil(
      context.defenderMilitary.airForce * 0.5,
    );
    const defenderHasOil =
      context.defender.resources.oil >= defenderOilRequired;
    const defenderOilPenalty = defenderHasOil ? 1.0 : 0.3;

    const attackerBase =
      (context.attackForce.infantry * 1.0 +
        context.attackForce.airForce * 3.0) *
      (1 + context.attackForce.techLevel * 0.15) *
      (1 + context.attackForce.experience * 0.005) *
      attackerAttackBonus *
      distanceMultiplier *
      govTraitsAttacker.militaryPowerMultiplier *
      attackerOilPenalty;

    let defenderBase =
      (context.defenderInfantryAfterDrone * 1.0 +
        context.defenderMilitary.airForce * 3.0) *
      (1 + context.defenderMilitary.techLevel * 0.15) *
      (1 + context.defenderMilitary.experience * 0.005) *
      defenderHomeBonus *
      context.defenderDebuffMultiplier *
      govTraitsDefender.militaryPowerMultiplier *
      defenderOilPenalty;

    if (this.traitManager.hasTrait(context.defender, "SOVEREIGN_FORTRESS")) {
      defenderBase *= 2.0;
    }

    const rngFactorAttacker = 0.9 + context.prng.nextFloat() * 0.2;
    const rngFactorDefender = 0.9 + context.prng.nextFloat() * 0.2;

    context.attackerScore = Math.floor(attackerBase * rngFactorAttacker);
    context.defenderScore = Math.floor(defenderBase * rngFactorDefender);
    context.attackerWon = context.attackerScore > context.defenderScore;
  }
}
