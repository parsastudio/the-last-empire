import type { Nation } from "@/domain/nation/nation.schema";
import type { MilitaryStack } from "@/domain/military/military.schema";
import { SeededRandom } from "@/domain/shared/seeded-random";
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
    prng: SeededRandom,
  ): CombatResult {
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
      deployedDronesCount: attackForce.droneMissile,
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
