import React from "react";
import { useTranslations } from "next-intl";
import { LucideIcon, Coins } from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface MilitaryForceUnitCardProps {
  icon: LucideIcon;
  iconColorClass: string;
  bgClass: string;
  name: string;
  unitLabel: string;
  payrollCost: number;
  count: number;
  techRating: number;
}

export function MilitaryForceUnitCard({
  icon: Icon,
  iconColorClass,
  bgClass,
  name,
  unitLabel,
  payrollCost,
  count,
  techRating,
}: MilitaryForceUnitCardProps) {
  const t = useTranslations("military");
  const { formatCurrency, formatNumber, formatLevel } = useLocaleFormatter();

  return (
    <div className="bg-gradient-to-b from-card via-secondary/70 to-card/95 border border-border/80 hover:border-primary/50 p-4 rounded-3xl flex flex-col justify-between space-y-3 text-start font-sans shadow-lg hover:shadow-xl transition-all duration-200 ring-1 ring-white/5 group relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 shadow-md transition-transform group-hover:scale-105 ${bgClass} ${iconColorClass}`}
          >
            <Icon size={20} />
          </div>

          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-black text-foreground block truncate">
              {name}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 truncate">
              <Coins size={11} className="text-amber-400 shrink-0" />
              <span>{formatCurrency(payrollCost, true)}</span>
              <span className="text-[9px] opacity-75">{t("perTurn")}</span>
            </span>
          </div>
        </div>

        <div className="text-end font-mono shrink-0">
          <span className="text-base sm:text-lg font-black text-foreground block leading-tight tracking-tight">
            {formatNumber(count)}
          </span>
          <span className="text-[9px] text-muted-foreground font-sans font-medium block">
            {unitLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-border/50 text-[10px] font-mono">
        <span className="text-muted-foreground font-sans text-[10px]">
          {t("averageTech")}
        </span>
        <span className="font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-lg shadow-sm">
          {formatLevel(techRating)}
        </span>
      </div>
    </div>
  );
}
