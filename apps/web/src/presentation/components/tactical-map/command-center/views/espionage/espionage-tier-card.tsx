import React from "react";
import { useTranslations } from "next-intl";
import { LucideIcon, Coins, CheckCircle2, Lock, Zap } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface EspionageTierCardProps {
  tier: 1 | 2 | 3;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColorClass: string;
  borderColorClass: string;
  cost: number;
  successRate: number;
  isExecutedThisTurn: boolean;
  canAfford: boolean;
  isDisabledCondition?: boolean;
  disabledReasonText?: string;
  isExecuting: boolean;
  onExecute: () => void;
}

export function EspionageTierCard({
  tier,
  title,
  subtitle,
  icon: Icon,
  iconColorClass,
  borderColorClass,
  cost,
  successRate,
  isExecutedThisTurn,
  canAfford,
  isDisabledCondition = false,
  disabledReasonText,
  isExecuting,
  onExecute,
}: EspionageTierCardProps) {
  const t = useTranslations("espionage.tierCard");

  const isButtonDisabled =
    isExecutedThisTurn || !canAfford || isDisabledCondition || isExecuting;

  return (
    <div
      className={`bg-background/40 border ${borderColorClass} p-4.5 rounded-3xl space-y-3.5 shadow-sm transition-all`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-2xl bg-secondary/80 flex items-center justify-center ${iconColorClass}`}
          >
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-foreground">{title}</h4>
            <span className="text-[10px] text-muted-foreground font-sans block">
              {t("tierLevel", {
                tier: PersianNumberFormatter.toPersianDigits(tier),
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="bg-secondary/80 border border-border/60 px-2 py-0.5 rounded-lg font-bold text-foreground">
            {t("successRate", {
              rate: PersianNumberFormatter.toPersianDigits(
                Math.round(successRate * 100),
              ),
            })}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed font-sans bg-secondary/20 p-2.5 rounded-2xl border border-border/40">
        {subtitle}
      </p>

      <div className="flex items-center justify-between text-xs font-mono bg-secondary/40 p-2.5 rounded-xl">
        <span className="text-muted-foreground font-sans text-[10px]">
          {t("requiredBudget")}
        </span>
        <span className="font-extrabold text-gdp flex items-center gap-1">
          <Coins size={13} />
          {PersianNumberFormatter.formatCurrency(cost)}
        </span>
      </div>

      {isDisabledCondition && disabledReasonText ? (
        <div className="p-2.5 bg-secondary/60 border border-border/60 rounded-xl flex items-center gap-1.5 text-[10px] text-amber-500 font-sans">
          <Lock size={12} className="shrink-0" />
          <span>{disabledReasonText}</span>
        </div>
      ) : null}

      <button
        onClick={onExecute}
        disabled={isButtonDisabled}
        className={`w-full py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-50 disabled:shadow-none ${
          tier === 3
            ? "bg-amber-500 hover:bg-amber-500/90 text-primary-foreground shadow-amber-500/20"
            : tier === 2
              ? "bg-military hover:bg-military/90 text-primary-foreground shadow-military/20"
              : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
        }`}
      >
        {isExecuting ? (
          <span>{t("submitting")}</span>
        ) : isExecutedThisTurn ? (
          <>
            <CheckCircle2 size={14} />
            <span>{t("executedThisTurn")}</span>
          </>
        ) : !canAfford ? (
          <span>{t("insufficientFunds")}</span>
        ) : (
          <>
            <Zap size={14} />
            <span>{t("executeBtn")}</span>
          </>
        )}
      </button>
    </div>
  );
}
