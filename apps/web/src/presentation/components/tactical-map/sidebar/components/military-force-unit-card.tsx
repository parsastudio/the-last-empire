import React from "react";
import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface MilitaryForceUnitCardProps {
  icon: LucideIcon;
  iconColorClass: string;
  name: string;
  payrollCost: number;
  count: number;
  techRating: number;
}

export function MilitaryForceUnitCard({
  icon: Icon,
  iconColorClass,
  name,
  payrollCost,
  count,
  techRating,
}: MilitaryForceUnitCardProps) {
  const t = useTranslations("military");
  const { formatCurrency, formatNumber, formatLevel } = useLocaleFormatter();

  return (
    <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex flex-col justify-between space-y-2 text-start font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon size={14} className={`${iconColorClass} shrink-0`} />
          <div className="space-y-0.5">
            <span className="text-foreground font-bold block font-sans">
              {name}
            </span>
            <span className="text-[9px] text-muted-foreground block font-sans">
              {formatCurrency(payrollCost)}
            </span>
          </div>
        </div>
        <span className="text-xs font-extrabold text-foreground font-mono">
          {formatNumber(count)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] font-mono">
        <span className="text-muted-foreground font-sans text-[9px]">
          {t("averageTech")}
        </span>
        <span className="font-bold text-amber-500 bg-secondary/80 px-2 py-0.5 rounded-md border border-border/50">
          {t("techLevelBadge", {
            level: formatLevel(techRating),
          })}
        </span>
      </div>
    </div>
  );
}
