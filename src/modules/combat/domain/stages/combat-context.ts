import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { MilitaryStack } from "@/modules/military/schemas/military.schema";
import { SeededRandom } from "@/core/math/seeded-random";

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
