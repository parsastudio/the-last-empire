import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { EspionageCalculator } from "@/engine/espionage/espionage-calculator";
import { ActionFactory } from "@/domain/game/action-factory";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";

interface UseAttackReconRunnerProps {
  humanNation: Nation | null;
  targetNation: Nation | null;
  provincesMap?: Record<string, Province>;
}

export function useAttackReconRunner({
  humanNation,
  targetNation,
  provincesMap,
}: UseAttackReconRunnerProps) {
  const [isExecutingRecon, setIsExecutingRecon] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const isReconActive = useMemo(() => {
    if (!humanNation || !targetNation) return false;
    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetNation.id);
    const list = humanNation.executedEspionageTiers || [];
    return (
      list.includes(`${canonicalTarget}:1`) ||
      list.includes(`${targetNation.id}:1`)
    );
  }, [humanNation, targetNation]);

  const targetGdp = useMemo(() => {
    if (!targetNation) return 1000000000;
    return getNationGdp(targetNation, provincesMap);
  }, [targetNation, provincesMap]);

  const reconCost = useMemo(() => {
    return EspionageCalculator.calculateOperationCost(targetGdp, 1);
  }, [targetGdp]);

  const canAffordRecon = (humanNation?.treasury || 0) >= reconCost;

  const handleExecuteQuickRecon = useCallback(async () => {
    if (!humanNation || !targetNation || isExecutingRecon || !canAffordRecon) {
      return;
    }
    try {
      setIsExecutingRecon(true);
      const action = ActionFactory.executeEspionage(
        humanNation.id,
        targetNation.id,
        1,
      );
      await dispatchAction(
        action,
        "شنود ماهواره‌ای مواضع دشمن با موفقیت انجام شد.",
      );
    } finally {
      setIsExecutingRecon(false);
    }
  }, [
    humanNation,
    targetNation,
    isExecutingRecon,
    canAffordRecon,
    dispatchAction,
  ]);

  return {
    isReconActive,
    reconCost,
    canAffordRecon,
    isExecutingRecon,
    handleExecuteQuickRecon,
  };
}
