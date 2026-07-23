import type { Nation } from "@/domain/nation/nation.schema";
import type { MilitaryStack } from "@/domain/military/military.schema";
import { SeededRandom } from "@/domain/shared/seeded-random";

export interface CombatContext {
  attacker: Nation;
  defender: Nation;
  attackForce: MilitaryStack;
  defenderMilitary: MilitaryStack;
  prng: SeededRandom;
  defenderInfantryAfterDrone: number;
  defenderDebuffMultiplier: number;
  attackerScore: number;
  defenderScore: number;
  attackerWon: boolean;
  deployedDronesCount: number;
}
