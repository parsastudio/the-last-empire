import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { MilitaryStack } from "@/modules/military/schemas/military.schema";
import { SeededRandom } from "@/core/math/seeded-random";
import { CombatContext } from "./stages/combat-context";
import { CombatStage } from "./stages/combat-stage";
import { AirSuperiorityStage } from "./stages/air-superiority-stage";
import { DroneStrikeStage } from "./stages/drone-strike-stage";
import { ScoreFormulationStage } from "./stages/score-formulation-stage";
import { CasualtyStage } from "./stages/casualty-stage";

export interface CombatResult {
  attackerWon: boolean;
  attackerScore: number;
  defenderScore: number;
  updatedAttackerMilitary: MilitaryStack;
  updatedDefenderMilitary: MilitaryStack;
}

export class CombatResolver {
  private stages: CombatStage[] = [
    new AirSuperiorityStage(),
    new DroneStrikeStage(),
    new ScoreFormulationStage(),
    new CasualtyStage(),
  ];

  public resolveCombat(
    attacker: Nation,
    defender: Nation,
    attackForce: MilitaryStack,
    seed: number,
  ): CombatResult {
    const prng = new SeededRandom(seed);

    const context: CombatContext = {
      attacker,
      defender,
      attackForce: { ...attackForce },
      defenderMilitary: { ...defender.military },
      prng,
      defenderInfantryAfterDrone: defender.military.infantry,
      defenderDebuffMultiplier: 1.0,
      attackerScore: 0,
      defenderScore: 0,
      attackerWon: false,
    };

    for (const stage of this.stages) {
      stage.process(context);
    }

    return {
      attackerWon: context.attackerWon,
      attackerScore: context.attackerScore,
      defenderScore: context.defenderScore,
      updatedAttackerMilitary: context.attackForce,
      updatedDefenderMilitary: context.defenderMilitary,
    };
  }
}
