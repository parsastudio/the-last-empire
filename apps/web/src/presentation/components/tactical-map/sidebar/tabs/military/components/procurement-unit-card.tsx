import React from "react";
import { useTranslations } from "next-intl";
import { Plus, Coins, ShieldCheck, TrendingUp } from "lucide-react";
import { UnitType } from "@geopolitics/domain";
import { FloatingFeedback } from "@/presentation/hooks/game/use-floating-feedback";
import { MILITARY_UNIT_VISUALS } from "@/presentation/configs/military-unit-visuals.config";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

export interface ProcurementUnitItemInfo {
  type: UnitType;
  unitPrice: number;
  batchQuantity: number;
  batchCost: number;
  canAfford: boolean;
  remainingRoom: number;
  isCapReached: boolean;
  techMultiplier?: number;
  techDelta?: number;
}

interface ProcurementUnitCardProps {
  info: ProcurementUnitItemInfo;
  variant?: "domestic" | "allied";
  feedbacks?: FloatingFeedback[];
  onBuy: (info: ProcurementUnitItemInfo) => void;
}

export function ProcurementUnitCard({
  info,
  variant = "domestic",
  feedbacks = [],
  onBuy,
}: ProcurementUnitCardProps) {
  const t = useTranslations("military");
  const { formatCurrency, formatPercent, formatNumber } = useLocaleFormatter();
  const visual = MILITARY_UNIT_VISUALS[info.type];
  const Icon = visual.icon;

  const isAllied = variant === "allied";
  const surchargeRate =
    isAllied && info.techMultiplier && info.techMultiplier > 1
      ? Math.round((info.techMultiplier - 1.0) * 100)
      : 0;

  const borderClass = info.isCapReached
    ? "border-border/60 opacity-60"
    : info.canAfford
      ? isAllied
        ? "border-border/80 hover:border-amber-500/50 hover:bg-secondary/60"
        : "border-border/80 hover:border-gdp/50 hover:bg-secondary/60"
      : "border-border/60 opacity-60";

  const buttonBgClass = isAllied
    ? "bg-amber-500 hover:bg-amber-500/90 shadow-amber-500/20 border-amber-400/40"
    : "bg-gdp hover:bg-gdp/90 shadow-gdp/20 border-gdp/30";

  const feedbackColorClass = isAllied ? "text-amber-400" : "text-gdp";

  return (
    <div
      className={`relative p-4 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 font-sans text-start select-none bg-gradient-to-b from-card via-secondary/70 to-card/95 shadow-md hover:shadow-xl ring-1 ring-white/5 ${borderClass}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 shadow-inner ${visual.bgClass} ${visual.colorClass}`}
        >
          <Icon size={20} />
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-black text-foreground">
              {t(`${info.type}.name`)}
            </span>
            {surchargeRate > 0 && (
              <span className="text-[9px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <TrendingUp size={9} />
                <span>
                  {t("techDisparity", {
                    pct: formatPercent(surchargeRate),
                  })}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono flex-wrap">
            <span>
              {t("unitPrice", {
                price: formatCurrency(info.unitPrice),
              })}
            </span>
            <span>•</span>
            <span className="text-foreground/90 font-sans">
              {t("remainingRoom", {
                count: formatNumber(info.remainingRoom),
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="relative shrink-0 flex items-center justify-end">
        <div className="absolute -top-4 start-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center z-30">
          {feedbacks.map((f) => (
            <span
              key={f.id}
              className={`text-xs font-black font-mono drop-shadow-md animate-out fade-out slide-out-to-top-4 duration-500 whitespace-nowrap ${feedbackColorClass}`}
            >
              {f.text}
            </span>
          ))}
        </div>

        {info.isCapReached ? (
          <div className="py-2.5 px-3.5 bg-amber-500/15 text-amber-400 rounded-2xl text-[11px] font-mono border border-amber-500/30 flex items-center gap-1.5 shadow-inner">
            <ShieldCheck size={13} />
            <span>{isAllied ? t("armyCapReached") : t("capReached")}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onBuy(info)}
            disabled={!info.canAfford}
            className={`py-2.5 px-4 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-40 text-primary-foreground rounded-2xl text-xs font-black font-mono transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border ${buttonBgClass}`}
            title={t("quickProcurementTitle", {
              cost: formatCurrency(info.batchCost),
            })}
          >
            <Plus size={14} strokeWidth={3} />
            <Coins size={13} className="opacity-90 shrink-0" />
            <span className="font-extrabold text-xs">
              {formatCurrency(info.batchCost)}
            </span>
            <span className="text-[10px] font-bold opacity-90 ms-0.5 bg-black/20 px-2 py-0.5 rounded-lg">
              {t("unitCountBadge", {
                count: formatNumber(info.batchQuantity),
              })}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
