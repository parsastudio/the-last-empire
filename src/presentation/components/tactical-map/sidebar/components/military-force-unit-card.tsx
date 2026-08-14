import React from "react";
import { LucideIcon } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { UnitTechBreakdownBadge } from "@/presentation/components/tactical-map/sidebar/components/unit-tech-breakdown-badge";

interface MilitaryForceUnitCardProps {
  icon: LucideIcon;
  iconColorClass: string;
  name: string;
  payrollCost: number;
  count: number;
  breakdown: Record<number, number>;
}

export function MilitaryForceUnitCard({
  icon: Icon,
  iconColorClass,
  name,
  payrollCost,
  count,
  breakdown,
}: MilitaryForceUnitCardProps) {
  return (
    <div className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon size={14} className={`${iconColorClass} shrink-0`} />
          <div className="space-y-0.5">
            <span className="text-foreground font-bold block font-sans">
              {name}
            </span>
            <span className="text-[9px] text-muted-foreground block font-sans">
              {PersianNumberFormatter.formatCurrency(payrollCost)}
            </span>
          </div>
        </div>
        <span className="text-xs font-extrabold text-foreground">
          {PersianNumberFormatter.toPersianDigits(
            count.toLocaleString("en-US"),
          )}
        </span>
      </div>
      <UnitTechBreakdownBadge breakdown={breakdown} />
    </div>
  );
}
