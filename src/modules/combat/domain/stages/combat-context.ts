import type { Nation, MilitaryStack } from "@/core/types";
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
}
