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
    rawDefAirLoss: number;
    defArmorDestroyedByAir: number;
  };
}

export class BattlePhaseOrchestrator {
  public static executePhases(
    defAirDefense: number,
    deployedAirForce: number,
    defAirForce: number,
    deployedArmor: number,
    defArmor: number,
    deployedInfantry: number,
    defInfantry: number,
    defAdMult: number,
    attAirMult: number,
    defAirMult: number,
    attArmorMult: number,
    defArmorMult: number,
    attInfMult: number,
    defInfMult: number,
  ): PhaseOrchestrationResult {
    const airPhase = AirSupremacyPhase.calculate({
      deployedAirForce,
      defAirForce,
      defArmor,
      attAirMult,
      defAirMult,
      defArmorMult,
      defAirDefenseRemainingEff: defAirDefense * defAdMult,
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

    return {
      phase1Missile: {
        dronesLaunched: 0,
        defAirDefense,
        airDefenseLost: 0,
        dronesIntercepted: 0,
        phaseWinner: "SKIPPED",
      },
      phase2Air: {
        attAirForce: deployedAirForce,
        defAirForce,
        attAirLost: airPhase.rawAttAirLoss,
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
    };
  }
}
