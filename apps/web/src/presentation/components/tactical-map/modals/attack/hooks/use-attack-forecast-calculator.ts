import { useMemo } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { TacticalForecast } from "@/presentation/components/tactical-map/modals/attack/attack-intel-panel";

interface UseAttackForecastCalculatorProps {
  humanNation: Nation | null;
  targetNation: Nation | null;
  targetGuarantorNation: Nation | null;
  dronesToLaunch: number;
  infantryToDeploy: number;
  armorToDeploy: number;
  airForceToDeploy: number;
  provincesMap?: Record<string, Province>;
}

export function useAttackForecastCalculator({
  humanNation,
  targetNation,
  targetGuarantorNation,
  dronesToLaunch,
  infantryToDeploy,
  armorToDeploy,
  airForceToDeploy,
  provincesMap,
}: UseAttackForecastCalculatorProps): TacticalForecast {
  return useMemo<TacticalForecast>(() => {
    if (!humanNation || !targetNation) {
      return {
        winProbability: 0,
        isVictoryPredicted: false,
        isCapitulationPredicted: false,
        phase1Prediction: "نامشخص",
        phase2Prediction: "نامشخص",
        phase3Prediction: "نامشخص",
        valuationRatio: 1,
      };
    }

    const calc = BattleCalculator.calculateBattle(
      humanNation,
      targetNation,
      dronesToLaunch,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      provincesMap,
      targetGuarantorNation,
    );

    let winProb = 50;
    if (calc.isAttackerVictory) {
      winProb = Math.min(99, Math.round(55 + (calc.valuationRatio - 1.0) * 35));
    } else {
      winProb = Math.max(1, Math.round(45 * calc.valuationRatio));
    }

    return {
      winProbability: winProb,
      isVictoryPredicted: calc.isAttackerVictory,
      isCapitulationPredicted: Boolean(calc.isFullCapitulation),
      phase1Prediction: calc.phase1Missile.phaseWinner,
      phase2Air: calc.phase2Air,
      phase2Prediction: calc.phase2Air.phaseWinner,
      phase3Prediction: calc.phase3Ground.phaseWinner,
      valuationRatio: calc.valuationRatio,
      auxiliaryGuarantor: calc.auxiliaryGuarantor,
    };
  }, [
    humanNation,
    targetNation,
    targetGuarantorNation,
    dronesToLaunch,
    infantryToDeploy,
    armorToDeploy,
    airForceToDeploy,
    provincesMap,
  ]);
}
