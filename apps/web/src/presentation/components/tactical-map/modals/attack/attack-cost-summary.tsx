import React from "react";
import { useTranslations } from "next-intl";
import { Coins, Wallet, Anchor, Swords, ShieldAlert } from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface AttackCostSummaryProps {
  totalLogisticsCost: number;
  currentTreasury: number;
  canAfford: boolean;
  hasSelectedInfantry: boolean;
  isSubmitting: boolean;
  isLandNeighbor: boolean;
  isNavalValid?: boolean;
  hasNavalCapacity?: boolean;
  hasAlreadyAttackedThisTurn?: boolean;
  attackType?: "LAND" | "NAVAL";
  onExecute: () => void;
}

export function AttackCostSummary({
  totalLogisticsCost,
  currentTreasury,
  canAfford,
  hasSelectedInfantry,
  isSubmitting,
  isLandNeighbor,
  isNavalValid = false,
  hasNavalCapacity = true,
  hasAlreadyAttackedThisTurn = false,
  attackType = "LAND",
  onExecute,
}: AttackCostSummaryProps) {
  const t = useTranslations("attack.summary");
  const { formatCurrency } = useLocaleFormatter();

  const isAccessible = isLandNeighbor || isNavalValid;
  const isButtonDisabled =
    !isAccessible ||
    !hasSelectedInfantry ||
    !canAfford ||
    !hasNavalCapacity ||
    hasAlreadyAttackedThisTurn ||
    isSubmitting;

  const isNaval = attackType === "NAVAL";

  return (
    <div className="space-y-3.5 pt-2 border-t border-border/60 text-start font-sans">
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl space-y-3 font-mono text-xs shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <span className="text-[11px] font-bold text-foreground font-sans flex items-center gap-1.5">
            <Coins size={14} className="text-gdp" />
            {t("logisticsBilling")}
          </span>
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-sans">
            <Wallet size={12} className="text-primary" />
            <span>{t("treasury")}</span>
            <span className="font-mono font-bold text-foreground">
              {formatCurrency(currentTreasury)}
            </span>
          </div>
        </div>

        <div className="bg-background/60 p-3 rounded-2xl border border-border/40 flex items-center justify-between">
          <span className="text-muted-foreground text-[11px] font-sans flex items-center gap-1.5">
            {isNaval ? (
              <Anchor size={13} className="text-gdp" />
            ) : (
              <Coins size={13} className="text-gdp" />
            )}
            {isNaval ? t("navalCostLabel") : t("landCostLabel")}
          </span>
          <span
            className={`font-bold text-sm ${canAfford ? "text-gdp" : "text-military"}`}
          >
            {formatCurrency(totalLogisticsCost)}
          </span>
        </div>
      </div>

      {!canAfford && (
        <div className="p-3 bg-military/15 border border-military/30 rounded-2xl flex items-center gap-2 text-xs text-military">
          <ShieldAlert size={15} className="shrink-0" />
          <span>{t("insufficientFundsAlert")}</span>
        </div>
      )}

      {isNaval && !hasNavalCapacity && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-400">
          <Anchor size={15} className="shrink-0" />
          <span>{t("navalCapacityAlert")}</span>
        </div>
      )}

      <button
        onClick={onExecute}
        disabled={isButtonDisabled}
        className="w-full py-4 bg-military hover:bg-military/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-black text-xs transition-all cursor-pointer shadow-xl shadow-military/20 flex items-center justify-center gap-2 hover:scale-[1.005] active:scale-[0.995]"
      >
        {isNaval ? <Anchor size={16} /> : <Swords size={16} />}
        <span>
          {isSubmitting
            ? t("submitting")
            : hasAlreadyAttackedThisTurn
              ? t("alreadyAttacked")
              : !isAccessible
                ? t("inaccessible")
                : isNaval && !hasNavalCapacity
                  ? t("insufficientNavalCapacity")
                  : !hasSelectedInfantry
                    ? t("infantryRequired")
                    : !canAfford
                      ? t("insufficientTreasury")
                      : isNaval
                        ? t("executeNaval", {
                            cost: formatCurrency(totalLogisticsCost),
                          })
                        : t("executeLand", {
                            cost: formatCurrency(totalLogisticsCost),
                          })}
        </span>
      </button>
    </div>
  );
}
