import type { Nation, MilitaryStack } from "@/core/types";
import { SeededRandom } from "@/core/math/seeded-random";
import { AirSuperiorityCalculator } from "./air-superiority";
import { DroneStrikeCalculator } from "./drone-strike-calculator";
import { CasualtyCalculator } from "./casualty-calculator";
import { TraitManager } from "@/modules/nation/domain/trait-manager";

export interface CombatResult {
  attackerWon: boolean;
  attackerScore: number;
  defenderScore: number;
  updatedAttackerMilitary: MilitaryStack;
  updatedDefenderMilitary: MilitaryStack;
}

export class CombatResolver {
  private airCalc = new AirSuperiorityCalculator();
  private droneCalc = new DroneStrikeCalculator();
  private casualtyCalc = new CasualtyCalculator();
  private traitManager = new TraitManager();

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

    const defenderHomeBonus =
      1.2 + this.traitManager.getCombatDefenseBonus(defender);
    const attackerAttackBonus =
      1.0 + this.traitManager.getCombatAttackBonus(attacker);
    const defenderDebuffMultiplier = 1.0 - airResult.defenderDefenseDebuff;

    const attackerBase =
      (attackForce.infantry * 1.0 +
        attackForce.airForce * 3.0 +
        attackForce.navy * 2.0 +
        attackForce.droneMissile * 2.5) *
      (1 + attackForce.techLevel * 0.15) *
      (1 + attackForce.experience * 0.005) *
      attackerAttackBonus;

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
import type { Nation, MilitaryStack } from "@/core/types";
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
