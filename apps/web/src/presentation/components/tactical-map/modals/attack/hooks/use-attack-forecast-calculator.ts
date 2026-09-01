import { useMemo } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { TacticalForecast } from "@/presentation/components/tactical-map/modals/attack/attack-intel-panel";

interface UseAttackForecastCalculatorProps {
  humanNation: Nation | null;
  targetNation: Nation | null;
  targetGuarantorNation?: Nation | null;
  dronesToLaunch?: number;
  infantryToDeploy: number;
  armorToDeploy: number;
  airForceToDeploy: number;
  provincesMap?: Record<string, Province>;
  targetProvinceId?: number;
}

export function useAttackForecastCalculator({
  humanNation,
  targetNation,
  targetGuarantorNation,
  dronesToLaunch = 0,
  infantryToDeploy,
  armorToDeploy,
  airForceToDeploy,
  provincesMap,
  targetProvinceId,
}: UseAttackForecastCalculatorProps): TacticalForecast {
  return useMemo(() => {
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

    const calcResult = BattleCalculator.calculateBattle(
      humanNation,
      targetNation,
      dronesToLaunch,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      provincesMap,
      targetGuarantorNation,
      targetProvinceId,
    );

    const isVictoryPredicted = calcResult.isAttackerVictory;
    const winProbability = isVictoryPredicted ? 100 : 0;
    const isCapitulationPredicted = calcResult.valuationRatio >= 3.0;

    let phase1Prediction = "عملیات پرتاب موشک انجام نشد";
    if (dronesToLaunch > 0) {
      if (calcResult.phase1Missile.phaseWinner === "ATTACKER") {
        phase1Prediction = "نفوذ موفق موشک‌ها و تضعیف پدافند";
      } else {
        phase1Prediction = "رهگیری موشک‌ها توسط سامانه پدافند";
      }
    }

    let phase2Prediction = "توازن قوای هوایی";
    if (calcResult.phase2Air.phaseWinner === "ATTACKER") {
      phase2Prediction = "برتری کامل شکاری‌های خودی";
    } else if (calcResult.phase2Air.phaseWinner === "DEFENDER") {
      phase2Prediction = "پدافند هوایی موثر مدافع";
    }

    let phase3Prediction = "ریسک بالای شکست سنگرها";
    if (calcResult.phase3Ground.phaseWinner === "ATTACKER") {
      phase3Prediction = "شکست قطعی خطوط زمینی دشمن";
    }

    return {
      winProbability,
      isVictoryPredicted,
      isCapitulationPredicted,
      phase1Prediction,
      phase2Prediction,
      phase3Prediction,
      valuationRatio: calcResult.valuationRatio,
      phase2Air: calcResult.phase2Air,
      auxiliaryGuarantor: calcResult.auxiliaryGuarantor,
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
    targetProvinceId,
  ]);
}
