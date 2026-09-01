import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  BattleCalculator,
  BattleCalculationResult,
} from "@/engine/combat/battle-calculator";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";
import { GuarantorInterventionCalculator } from "@/engine/combat/calculator/guarantor-intervention-calculator";
import { MissileInterceptionPhase } from "@/engine/combat/phases/missile-interception-phase";
import { AirSupremacyPhase } from "@/engine/combat/phases/air-supremacy-phase";
import { DeploymentStepSearch } from "@/engine/combat/optimizer/deployment-step-search";

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
    targetProvinceId?: number,
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
        targetProvinceId,
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
    const defMults = CombatModifierResolver.resolveAllUnitMultipliers(defender);

    let defAirDefense = defender.military.airDefense || 0;
    let defAirForce = defender.military.airForce || 0;
    let defArmor = defender.military.armor || 0;
    let defInfantry = defender.military.infantry || 0;

    const guarantorResult =
      GuarantorInterventionCalculator.calculateIntervention(
        attacker,
        defender,
        provincesMap,
        guarantorNation,
      );

    defAirForce += guarantorResult.auxAir;
    defArmor += guarantorResult.auxArm;
    defAirDefense += guarantorResult.auxAD;
    defInfantry += guarantorResult.auxInf;

    const optimalDrones = this.calculateOptimalDrones(
      maxDrone,
      defAirDefense,
      attMults.droneMissile,
      defMults.airDefense,
    );

    const missilePhaseResult = MissileInterceptionPhase.calculate({
      deployedDrones: optimalDrones,
      defAirDefense,
      attDroneMult: attMults.droneMissile,
      defAdMult: defMults.airDefense,
    });

    const optimalAirForce = this.calculateOptimalAirForce(
      maxAir,
      defAirForce,
      defArmor,
      attMults.airForce,
      defMults.airForce,
      defMults.armor,
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

  private static calculateOptimalDrones(
    maxDrone: number,
    defAirDefense: number,
    attDroneMult: number,
    defAdMult: number,
  ): number {
    if (defAirDefense <= 0 || maxDrone <= 0) {
      return 0;
    }

    let low = 1;
    let high = maxDrone;
    let optimal = maxDrone;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const res = MissileInterceptionPhase.calculate({
        deployedDrones: mid,
        defAirDefense,
        attDroneMult,
        defAdMult,
      });

      if (res.defAirDefenseRemainingRaw === 0) {
        optimal = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return optimal;
  }

  private static calculateOptimalAirForce(
    maxAir: number,
    defAirForce: number,
    defArmor: number,
    attAirMult: number,
    defAirMult: number,
    defArmorMult: number,
    defAirDefenseRemainingRaw: number,
  ): number {
    if (maxAir <= 0) return 0;
    if (defAirForce <= 0 && defArmor <= 0) return 0;

    let low = 0;
    let high = maxAir;
    let optimal = maxAir;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const res = AirSupremacyPhase.calculate({
        deployedAirForce: mid,
        defAirForce,
        defArmor,
        attAirMult,
        defAirMult,
        defArmorMult,
        defAirDefenseRemainingRaw,
      });

      const airCleared = defAirForce <= 0 || res.rawDefAirLoss >= defAirForce;
      const armorCleared =
        defArmor <= 0 || res.defArmorDestroyedByAir >= defArmor;

      if (airCleared && armorCleared) {
        optimal = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return optimal;
  }
}
