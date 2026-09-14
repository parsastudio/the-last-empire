import React from "react";
import { useTranslations } from "next-intl";
import { Plus, Coins, ShieldCheck, Zap, TrendingUp } from "lucide-react";
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
    ? "border-border/60"
    : info.canAfford
      ? isAllied
        ? "hover:border-amber-500/50"
        : "hover:border-gdp/50"
      : "border-border/60";

  const buttonBgClass = isAllied
    ? "bg-amber-500 hover:bg-amber-500/90 shadow-amber-500/20 border-amber-400/30"
    : "bg-gdp hover:bg-gdp/90 shadow-gdp/20 border-gdp/30";

  const feedbackColorClass = isAllied ? "text-amber-400" : "text-gdp";

  return (
    <div
      className={`relative p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 font-sans text-start select-none ${
        info.isCapReached
          ? "bg-secondary/30 opacity-60"
          : info.canAfford
            ? "bg-card/90 border-border/80 hover:bg-card shadow-sm"
            : "bg-background/40 opacity-60"
      } ${borderClass}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${visual.bgClass} ${visual.colorClass}`}
        >
          <Icon size={18} />
        </div>

        <div className="space-y-0.5 text-start">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-foreground">
              {t(`${info.type}.name`)}
            </span>
            {surchargeRate > 0 && (
              <span className="text-[9px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                <TrendingUp size={9} />
                {t("techDisparity", {
                  pct: formatPercent(surchargeRate),
                })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span>
              {t("unitPrice", {
                price: formatCurrency(info.unitPrice),
              })}
            </span>
            <span className="text-[9px] text-foreground font-sans">
              {t("remainingRoom", {
                count: formatNumber(info.remainingRoom),
              })}
            </span>
            <span className="flex items-center gap-0.5 text-emerald-400 font-sans">
              <Zap size={10} />
              {t("instantDelivery")}
            </span>
          </div>
        </div>
      </div>

      <div className="relative shrink-0 flex items-center">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          {feedbacks.map((f) => (
            <span
              key={f.id}
              className={`text-xs font-black font-mono drop-shadow-md animate-out fade-out slide-out-to-top-3 duration-500 ${feedbackColorClass}`}
            >
              {f.text}
            </span>
          ))}
        </div>

        {info.isCapReached ? (
          <div className="py-2 px-3 bg-amber-500/15 text-amber-400 rounded-xl text-[10px] font-mono border border-amber-500/30 flex items-center gap-1">
            <ShieldCheck size={12} />
            <span>{isAllied ? t("armyCapReached") : t("capReached")}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onBuy(info)}
            disabled={!info.canAfford}
            className={`py-2.5 px-4 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-40 text-primary-foreground rounded-xl text-xs font-black font-mono transition-all cursor-pointer shadow-md hover:scale-[1.03] active:scale-[0.96] flex items-center gap-1.5 border ${buttonBgClass}`}
            title={t("quickProcurementTitle", {
              cost: formatCurrency(info.batchCost),
            })}
          >
            <Plus size={14} strokeWidth={3} />
            <Coins size={12} className="opacity-90 shrink-0" />
            <span className="font-extrabold text-xs">
              {formatCurrency(info.batchCost)}
            </span>
            <span className="text-[10px] font-medium opacity-85 ms-0.5">
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
