import React from "react";
import { useTranslations } from "next-intl";
import { Radio, AlertTriangle, Loader2 } from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface AttackFogReconCardProps {
  reconCost: number;
  canAffordRecon: boolean;
  isExecutingRecon: boolean;
  winProbability: number;
  probBg: string;
  probColor: string;
  onExecuteRecon: () => void;
}

export function AttackFogReconCard({
  reconCost,
  canAffordRecon,
  isExecutingRecon,
  winProbability,
  probBg,
  probColor,
  onExecuteRecon,
}: AttackFogReconCardProps) {
  const t = useTranslations("attack.recon");
  const { formatCurrency } = useLocaleFormatter();

  return (
    <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-3.5 rounded-3xl space-y-3 shadow-md backdrop-blur-xl text-start font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/25 shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-black text-foreground block">
              {t("blindTitle")}
            </span>
            <span className="text-[10px] text-muted-foreground block font-sans">
              {t("osintSubtitle")}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onExecuteRecon}
          disabled={!canAffordRecon || isExecutingRecon}
          className="py-2 px-3.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isExecutingRecon ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Radio size={13} className="animate-pulse" />
          )}
          <span>
            {t("scanButton", {
              cost: formatCurrency(reconCost),
            })}
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/40 font-mono text-xs">
        <span className="text-[11px] text-muted-foreground font-sans">
          {t("balanceEstimate")}
        </span>
        <span
          className={`font-black text-xs px-2.5 py-0.5 rounded-xl border ${probBg} ${probColor}`}
        >
          {winProbability === 100 ? t("likelyWin") : t("likelyLoss")}
        </span>
      </div>
    </div>
  );
}
