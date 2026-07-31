import { useMemo } from "react";
import { HumanResourceMetrics } from "@/presentation/hooks/game/use-game-resources";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export function useTopHudMetrics(metrics: HumanResourceMetrics) {
  return useMemo(() => {
    const formattedTreasury = PersianNumberFormatter.formatCurrency(
      metrics.treasury,
      true,
    );
    const formattedIncome = PersianNumberFormatter.formatSignedIncome(
      metrics.netIncomePerTurn,
    );

    const formattedOil = `${PersianNumberFormatter.toPersianDigits(
      metrics.oil.toLocaleString("en-US"),
    )} بلوک`;

    const formattedOilUsage = `${PersianNumberFormatter.toPersianDigits(
      metrics.oilRequiredPerTurn,
    )} مصرف`;

    const formattedSteel = `${PersianNumberFormatter.toPersianDigits(
      metrics.steel.toLocaleString("en-US"),
    )} بلوک`;

    const formattedManpower = PersianNumberFormatter.toPersianDigits(
      metrics.manpower.toLocaleString("en-US"),
    );

    return {
      formattedTreasury,
      formattedIncome,
      formattedOil,
      formattedOilUsage,
      formattedSteel,
      formattedManpower,
      isOilDeficit: metrics.oil < metrics.oilRequiredPerTurn,
    };
  }, [metrics]);
}
