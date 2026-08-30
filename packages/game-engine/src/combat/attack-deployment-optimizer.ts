import { Nation, NationGettersUtility } from "@geopolitics/domain";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";
import { DeploymentStepSearch } from "@/engine/combat/optimizer/deployment-step-search";
import { GuarantorInterventionCalculator } from "@/engine/combat/calculator/guarantor-intervention-calculator";

export interface OptimalDeploymentResult {
  infantry: number;
  armor: number;
  airForce: number;
  drones: number;
  canWin: boolean;
}

export class AttackDeploymentOptimizer {
  public static calculateOptimalDeployment(
    attacker: Nation,
    defender: Nation,
    provincesMap?: Record<string, import("@geopolitics/domain").Province>,
    guarantorNation?: Nation | null,
    attackType: "LAND" | "NAVAL" = "LAND",
    navalFleetCount = 0,
    allNations?: Record<string, Nation>,
  ): OptimalDeploymentResult {
    const maxInf = attacker.military.infantry || 0;
    const maxArmor = attacker.military.armor || 0;
    const maxAir = attacker.military.airForce || 0;
    const maxDrones = attacker.military.droneMissile || 0;

    if (maxInf <= 0) {
      return { infantry: 0, armor: 0, airForce: 0, drones: 0, canWin: false };
    }

    let effectiveGuarantor = guarantorNation;
    if (!effectiveGuarantor && defender.securityGuarantorId && allNations) {
      effectiveGuarantor =
        NationGettersUtility.resolveNation(
          defender.securityGuarantorId,
          allNations,
        ) || null;
    }

    const testBattle = (d: number, inf: number, arm: number, af: number) => {
      return BattleCalculator.calculateBattle(
        attacker,
        defender,
        d,
        inf,
        arm,
        af,
        provincesMap,
        effectiveGuarantor,
      );
    };

    const fullForcesClamped = NavalDeploymentClamper.clamp(
      maxInf,
      maxArmor,
      attackType,
      navalFleetCount,
    );

    const maxSim = testBattle(
      maxDrones,
      fullForcesClamped.inf,
      fullForcesClamped.arm,
      maxAir,
    );

    if (!maxSim.isAttackerVictory) {
      return {
        infantry: fullForcesClamped.inf,
        armor: fullForcesClamped.arm,
        airForce: maxAir,
        drones: maxDrones,
        canWin: false,
      };
    }

    let defAirDefense = defender.military.airDefense || 0;
    let defAirForce = defender.military.airForce || 0;
    let defArmor = defender.military.armor || 0;
    let defInfantry = defender.military.infantry || 0;

    if (
      effectiveGuarantor &&
      effectiveGuarantor.isAlive &&
      effectiveGuarantor.id !== attacker.id
    ) {
      const guarantorRes =
        GuarantorInterventionCalculator.calculateIntervention(
          attacker,
          defender,
          provincesMap,
          effectiveGuarantor,
        );

      defAirForce += guarantorRes.auxAir;
      defArmor += guarantorRes.auxArm;
      defAirDefense += guarantorRes.auxAD;
      defInfantry += guarantorRes.auxInf;
    }

    const attMults = CombatModifierResolver.resolveAllUnitMultipliers(attacker);
    const defMults = CombatModifierResolver.resolveAllUnitMultipliers(defender);

    const neededDrones =
      defAirDefense > 0
        ? Math.ceil(
            (defAirDefense * defMults.airDefense * 4.0) /
              Math.max(0.1, attMults.droneMissile),
          )
        : 0;
    let drones = Math.min(maxDrones, Math.max(0, neededDrones));

    const neededAir =
      defAirForce > 0 || defArmor > 0
        ? Math.ceil(
            (defAirForce * defMults.airForce * 1.6 +
              defArmor * defMults.armor * 0.6) /
              Math.max(0.1, attMults.airForce),
          ) + 2
        : 0;
    let air = Math.min(maxAir, Math.max(0, neededAir));

    const neededArmor =
      defArmor > 0 || defInfantry > 0
        ? Math.ceil(
            (defArmor * defMults.armor * 1.5 +
              defInfantry * defMults.infantry * 0.3) /
              Math.max(0.1, attMults.armor),
          ) + 2
        : 0;
    let armor = Math.min(maxArmor, Math.max(0, neededArmor));

    const neededInf =
      Math.ceil(
        (defInfantry * defMults.infantry * 1.5) /
          Math.max(0.1, attMults.infantry),
      ) + 5;
    let infantry = Math.max(1, Math.min(maxInf, neededInf));

    const initialClamped = NavalDeploymentClamper.clamp(
      infantry,
      armor,
      attackType,
      navalFleetCount,
    );
    infantry = initialClamped.inf;
    armor = initialClamped.arm;

    let sim = testBattle(drones, infantry, armor, air);

    if (!sim.isAttackerVictory) {
      drones = maxDrones;
      air = maxAir;
      const fullClamped = NavalDeploymentClamper.clamp(
        maxInf,
        maxArmor,
        attackType,
        navalFleetCount,
      );
      infantry = fullClamped.inf;
      armor = fullClamped.arm;
      sim = testBattle(drones, infantry, armor, air);
    }

    const optimized = DeploymentStepSearch.optimize(
      infantry,
      armor,
      air,
      drones,
      testBattle,
    );

    infantry = optimized.infantry;
    armor = optimized.armor;
    air = optimized.airForce;
    drones = optimized.drones;

    const finalValidation = testBattle(drones, infantry, armor, air);
    if (!finalValidation.isAttackerVictory) {
      drones = Math.min(maxDrones, drones + 2);
      air = Math.min(maxAir, air + 2);
      armor = Math.min(maxArmor, armor + 2);
      infantry = Math.min(maxInf, infantry + 5);
      const finalClamped = NavalDeploymentClamper.clamp(
        infantry,
        armor,
        attackType,
        navalFleetCount,
      );
      infantry = finalClamped.inf;
      armor = finalClamped.arm;
    }

    return {
      infantry: Math.max(1, infantry),
      armor,
      airForce: air,
      drones,
      canWin: true,
    };
  }
}
