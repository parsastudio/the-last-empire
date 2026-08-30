"use client";

import { useMemo } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { TacticalForecast } from "@/presentation/components/tactical-map/modals/attack/attack-intel-panel";

interface UseAttackForecastCalculatorProps {
  humanNation: Nation | null;
  targetNation: Nation | null;
  targetGuarantorNation?: Nation | null;
  infantryToDeploy: number;
  armorToDeploy: number;
  airForceToDeploy: number;
  provincesMap?: Record<string, Province>;
}

export function useAttackForecastCalculator({
  humanNation,
  targetNation,
  targetGuarantorNation,
  infantryToDeploy,
  armorToDeploy,
  airForceToDeploy,
  provincesMap,
}: UseAttackForecastCalculatorProps): TacticalForecast {
  return useMemo(() => {
    if (!humanNation || !targetNation) {
      return {
        winProbability: 50,
        isVictoryPredicted: false,
        isCapitulationPredicted: false,
        phase1Prediction: "نامشخص",
        phase2Prediction: "نامشخص",
        phase3Prediction: "نامشخص",
        valuationRatio: 1.0,
      };
    }

    const calcResult = BattleCalculator.calculateBattle(
      humanNation,
      targetNation,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      provincesMap,
      targetGuarantorNation,
    );

    const winProbability = Math.min(
      99,
      Math.max(
        1,
        Math.round(
          (calcResult.valuationRatio / (calcResult.valuationRatio + 1)) * 100,
        ),
      ),
    );

    return {
      winProbability,
      isVictoryPredicted: calcResult.isAttackerVictory,
      isCapitulationPredicted: calcResult.isFullCapitulation ?? false,
      phase1Prediction: "برتری هوایی و تسلط جنگنده‌ها",
      phase2Prediction: "مصاف یگان‌های زرهی و انهدام تانک‌ها",
      phase3Prediction: "درگیری پیاده‌نظام و تصرف خطوط دفاعی",
      valuationRatio: calcResult.valuationRatio,
      phase2Air: calcResult.phase2Air,
      auxiliaryGuarantor: calcResult.auxiliaryGuarantor,
    };
  }, [
    humanNation,
    targetNation,
    targetGuarantorNation,
    infantryToDeploy,
    armorToDeploy,
    airForceToDeploy,
    provincesMap,
  ]);
}
