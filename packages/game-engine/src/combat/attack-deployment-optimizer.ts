import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  BattleCalculator,
  BattleCalculationResult,
} from "@/engine/combat/battle-calculator";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";
import { MissileInterceptionPhase } from "@/engine/combat/phases/missile-interception-phase";
import { DeploymentStepSearch } from "@/engine/combat/optimizer/deployment-step-search";
import { GuarantorMultiplierBlender } from "@/engine/combat/optimizer/helpers/guarantor-multiplier-blender";
import { AirMissileDeploymentOptimizer } from "@/engine/combat/optimizer/helpers/air-missile-deployment-optimizer";

export interface OptimalDeploymentResult {
  drones: number;
  airForce: number;
  armor: number;
  infantry: number;
  winProbability: number;
  isPossible: boolean;
}

export class AttackDeploymentOptimizer {
  public static calculateOptimalDeployment(
    attacker: Nation,
    defender: Nation,
    provincesMap?: Record<string, Province>,
    guarantorNation?: Nation | null,
    attackType: "LAND" | "NAVAL" = "LAND",
    navalFleetCount = 0,
  ): OptimalDeploymentResult {
    const maxInf = attacker.military.infantry || 0;
    const maxArm = attacker.military.armor || 0;
    const maxAir = attacker.military.airForce || 0;
    const maxDrone = attacker.military.droneMissile || 0;

    if (maxInf <= 0) {
      return {
        drones: 0,
        airForce: 0,
        armor: 0,
        infantry: 0,
        winProbability: 0,
        isPossible: false,
      };
    }

    let clampedMaxInf = maxInf;
    let clampedMaxArm = maxArm;

    if (attackType === "NAVAL") {
      const clampedMax = NavalDeploymentClamper.clamp(
        maxInf,
        maxArm,
        "NAVAL",
        navalFleetCount,
      );
      clampedMaxInf = clampedMax.inf;
      clampedMaxArm = clampedMax.arm;
    }

    if (clampedMaxInf <= 0) {
      return {
        drones: 0,
        airForce: 0,
        armor: 0,
        infantry: 0,
        winProbability: 0,
        isPossible: false,
      };
    }

    const testBattle = (
      d: number,
      inf: number,
      arm: number,
      af: number,
    ): BattleCalculationResult => {
      let finalInf = inf;
      let finalArm = arm;

      if (attackType === "NAVAL") {
        const clamped = NavalDeploymentClamper.clamp(
          inf,
          arm,
          "NAVAL",
          navalFleetCount,
        );
        finalInf = clamped.inf;
        finalArm = clamped.arm;
      }

      return BattleCalculator.calculateBattle(
        attacker,
        defender,
        d,
        finalInf,
        finalArm,
        af,
        provincesMap,
        guarantorNation,
      );
    };

    const maxTest = testBattle(maxDrone, clampedMaxInf, clampedMaxArm, maxAir);

    if (!maxTest.isAttackerVictory) {
      return {
        drones: maxDrone,
        airForce: maxAir,
        armor: clampedMaxArm,
        infantry: clampedMaxInf,
        winProbability: 0,
        isPossible: false,
      };
    }

    const attMults = CombatModifierResolver.resolveAllUnitMultipliers(attacker);
    const blendedDef = GuarantorMultiplierBlender.blend(
      attacker,
      defender,
      provincesMap,
      guarantorNation,
    );

    const optimalDrones = AirMissileDeploymentOptimizer.calculateOptimalDrones(
      maxDrone,
      blendedDef.defAirDefense,
      attMults.droneMissile,
      blendedDef.defMults.airDefense,
    );

    const missilePhaseResult = MissileInterceptionPhase.calculate({
      deployedDrones: optimalDrones,
      defAirDefense: blendedDef.defAirDefense,
      attDroneMult: attMults.droneMissile,
      defAdMult: blendedDef.defMults.airDefense,
    });

    const optimalAirForce =
      AirMissileDeploymentOptimizer.calculateOptimalAirForce(
        maxAir,
        blendedDef.defAirForce,
        blendedDef.defArmor,
        attMults.airForce,
        blendedDef.defMults.airForce,
        blendedDef.defMults.armor,
        missilePhaseResult.defAirDefenseRemainingRaw,
      );

    const groundResult = DeploymentStepSearch.findMinimalGroundForces(
      optimalDrones,
      optimalAirForce,
      clampedMaxArm,
      clampedMaxInf,
      testBattle,
    );

    let finalInfantry = groundResult.infantry;
    let finalArmor = groundResult.armor;

    if (attackType === "NAVAL") {
      const clamped = NavalDeploymentClamper.clamp(
        finalInfantry,
        finalArmor,
        "NAVAL",
        navalFleetCount,
      );
      finalInfantry = clamped.inf;
      finalArmor = clamped.arm;
    }

    let finalVerification = testBattle(
      optimalDrones,
      finalInfantry,
      finalArmor,
      optimalAirForce,
    );

    if (!finalVerification.isAttackerVictory) {
      finalInfantry = clampedMaxInf;
      finalArmor = clampedMaxArm;
      finalVerification = testBattle(
        optimalDrones,
        finalInfantry,
        finalArmor,
        optimalAirForce,
      );
    }

    const isVictory = finalVerification.isAttackerVictory;

    return {
      drones: optimalDrones,
      airForce: optimalAirForce,
      armor: finalArmor,
      infantry: finalInfantry,
      winProbability: isVictory ? 100 : 0,
      isPossible: isVictory,
    };
  }
}
