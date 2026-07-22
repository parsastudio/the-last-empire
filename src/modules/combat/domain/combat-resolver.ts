import type { Nation } from "@/core/types/nation.types";
import type { MilitaryStack } from "@/core/types/military.types";
import { SeededRandom } from "@/core/math/seeded-random";
import { AirSuperiorityCalculator } from "./air-superiority";
import { DroneStrikeCalculator } from "./drone-strike-calculator";
import { CasualtyCalculator } from "./casualty-calculator";

export interface CombatResult {
  attackerWon: boolean;
  attackerScore: number;
  defenderScore: number;
  updatedAttackerMilitary: MilitaryStack;
  updatedDefenderMilitary: MilitaryStack;
}

export class CombatResolver {
  private airCalc: AirSuperiorityCalculator;
  private droneCalc: DroneStrikeCalculator;
  private casualtyCalc: CasualtyCalculator;

  constructor() {
    this.airCalc = new AirSuperiorityCalculator();
    this.droneCalc = new DroneStrikeCalculator();
    this.casualtyCalc = new CasualtyCalculator();
  }

  public resolveCombat(
    attacker: Nation,
    defender: Nation,
    attackForce: MilitaryStack,
    seed: number,
  ): CombatResult {
    const prng = new SeededRandom(seed);

    const airResult = this.airCalc.evaluateAirSuperiority(
      attackForce,
      defender.military,
    );
    const droneResult = this.droneCalc.calculateDroneImpact(
      attackForce,
      defender.military,
    );

    const defenderInfantryAfterDrone = droneResult.remainingDefenderInfantry;

    const defenderHomeBonus = 1.2;
    const defenderDebuffMultiplier = 1.0 - airResult.defenderDefenseDebuff;

    const attackerBase =
      (attackForce.infantry * 1.0 +
        attackForce.airForce * 3.0 +
        attackForce.navy * 2.0 +
        attackForce.droneMissile * 2.5) *
      (1 + attackForce.techLevel * 0.15) *
      (1 + attackForce.experience * 0.005);

    const defenderBase =
      (defenderInfantryAfterDrone * 1.0 +
        defender.military.airForce * 3.0 +
        defender.military.navy * 2.0 +
        defender.military.droneMissile * 2.5) *
      (1 + defender.military.techLevel * 0.15) *
      (1 + defender.military.experience * 0.005) *
      defenderHomeBonus *
      defenderDebuffMultiplier;

    const rngFactorAttacker = 0.9 + prng.nextFloat() * 0.2;
    const rngFactorDefender = 0.9 + prng.nextFloat() * 0.2;

    const finalAttackerScore = Math.floor(attackerBase * rngFactorAttacker);
    const finalDefenderScore = Math.floor(defenderBase * rngFactorDefender);

    const attackerWon = finalAttackerScore > finalDefenderScore;

    const casualties = this.casualtyCalc.calculateCasualties(
      finalAttackerScore,
      finalDefenderScore,
      attackForce,
      defender.military,
      attackerWon,
    );

    const updatedAttackerMilitary: MilitaryStack = {
      ...attackForce,
      infantry: Math.max(
        0,
        attackForce.infantry - casualties.attackerKilledInfantry,
      ),
      airForce: Math.max(
        0,
        attackForce.airForce - casualties.attackerKilledAirForce,
      ),
    };

    const updatedDefenderMilitary: MilitaryStack = {
      ...defender.military,
      infantry: Math.max(
        0,
        defenderInfantryAfterDrone - casualties.defenderKilledInfantry,
      ),
      airForce: Math.max(
        0,
        defender.military.airForce - casualties.defenderKilledAirForce,
      ),
    };

    return {
      attackerWon,
      attackerScore: finalAttackerScore,
      defenderScore: finalDefenderScore,
      updatedAttackerMilitary,
      updatedDefenderMilitary,
    };
  }
}
