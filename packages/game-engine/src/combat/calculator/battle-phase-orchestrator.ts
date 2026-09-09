import { MissileInterceptionPhase } from "@/engine/combat/phases/missile-interception-phase";
import { AirSupremacyPhase } from "@/engine/combat/phases/air-supremacy-phase";
import { GroundEngagementPhase } from "@/engine/combat/phases/ground-engagement-phase";
import {
  BattlePhaseReconDetail,
  BattlePhaseAirDetail,
  BattlePhaseGroundDetail,
} from "@/domain/reports/combat-report.schema";

export interface PhaseOrchestrationResult {
  phase1Missile: BattlePhaseReconDetail;
  phase2Air: BattlePhaseAirDetail;
  phase3Ground: BattlePhaseGroundDetail;
  groundPhaseOutput: {
    rawAttArmorLoss: number;
    rawDefArmorLost: number;
    rawAttInfantryLost: number;
    rawDefInfantryLost: number;
    isAttackerVictory: boolean;
  };
  airPhaseOutput: {
    rawAttAirLoss: number;
    attAirLostToDogfight: number;
    attAirLostToAirDefense: number;
    rawDefAirLoss: number;
    defArmorDestroyedByAir: number;
  };
  missilePhaseOutput: {
    rawDefAirDefenseLost: number;
    destroyedFactories: number;
  };
}

export class BattlePhaseOrchestrator {
  public static executePhases(
    deployedDrones: number,
    defAirDefense: number,
    deployedAirForce: number,
    defAirForce: number,
    deployedArmor: number,
    defArmor: number,
    deployedInfantry: number,
    defInfantry: number,
    attDroneMult: number,
    defAdMult: number,
    attAirMult: number,
    defAirMult: number,
    attArmorMult: number,
    defArmorMult: number,
    attInfMult: number,
    defInfMult: number,
    autoInterceptionBonus = 0,
  ): PhaseOrchestrationResult {
    const missilePhase = MissileInterceptionPhase.calculate({
      deployedDrones,
      defAirDefense,
      attDroneMult,
      defAdMult,
      autoInterceptionBonus,
    });

    const airPhase = AirSupremacyPhase.calculate({
      deployedAirForce,
      defAirForce,
      defArmor,
      attAirMult,
      defAirMult,
      defArmorMult,
      defAirDefenseRemainingRaw: missilePhase.defAirDefenseRemainingRaw,
    });

    const groundPhase = GroundEngagementPhase.calculate({
      deployedArmor,
      deployedInfantry,
      defInfantry,
      defArmorAfterAirRaw: airPhase.defArmorAfterAirRaw,
      defArmorAfterAirEff: airPhase.defArmorAfterAirEff,
      defArmorDestroyedByAir: airPhase.defArmorDestroyedByAir,
      attArmorMult,
      attInfMult,
      defArmorMult,
      defInfMult,
    });

    let phase1Winner: "ATTACKER" | "DEFENDER" | "DRAW" | "SKIPPED" = "SKIPPED";
    if (deployedDrones > 0) {
      if (
        missilePhase.rawDefAirDefenseLost > 0 ||
        missilePhase.destroyedFactories > 0
      ) {
        phase1Winner = "ATTACKER";
      } else if (defAirDefense > 0) {
        phase1Winner = "DEFENDER";
      } else {
        phase1Winner = "DRAW";
      }
    }

    let phase2Winner: "ATTACKER" | "DEFENDER" | "DRAW" = "DRAW";
    if (deployedAirForce > 0 || defAirForce > 0) {
      if (airPhase.rawDefAirLoss > airPhase.rawAttAirLoss) {
        phase2Winner = "ATTACKER";
      } else if (airPhase.rawAttAirLoss > airPhase.rawDefAirLoss) {
        phase2Winner = "DEFENDER";
      }
    }

    const phase3Winner = groundPhase.isAttackerVictory
      ? "ATTACKER"
      : "DEFENDER";

    const destructionScope =
      missilePhase.destroyedFactories > 0
        ? groundPhase.isAttackerVictory
          ? "OTHER_PROVINCES"
          : "ALL_PROVINCES"
        : "NONE";

    return {
      phase1Missile: {
        dronesLaunched: deployedDrones,
        defAirDefense,
        airDefenseLost: missilePhase.rawDefAirDefenseLost,
        dronesIntercepted: missilePhase.interceptedMissiles,
        destroyedFactories: missilePhase.destroyedFactories,
        factoryDestructionScope: destructionScope,
        phaseWinner: phase1Winner,
      },
      phase2Air: {
        attAirForce: deployedAirForce,
        defAirForce,
        attAirLost: airPhase.rawAttAirLoss,
        attAirLostToDogfight: airPhase.attAirLostToDogfight,
        attAirLostToAirDefense: airPhase.attAirLostToAirDefense,
        defAirLost: airPhase.rawDefAirLoss,
        defArmorDestroyedByAir: airPhase.defArmorDestroyedByAir,
        phaseWinner: phase2Winner,
      },
      phase3Ground: {
        attArmor: deployedArmor,
        defArmor,
        attArmorLost: groundPhase.rawAttArmorLoss,
        defArmorLost: groundPhase.rawDefArmorLost,
        attInfantry: deployedInfantry,
        defInfantry,
        attInfantryLost: groundPhase.rawAttInfantryLost,
        defInfantryLost: groundPhase.rawDefInfantryLost,
        phaseWinner: phase3Winner,
      },
      groundPhaseOutput: groundPhase,
      airPhaseOutput: airPhase,
      missilePhaseOutput: missilePhase,
    };
  }
}
