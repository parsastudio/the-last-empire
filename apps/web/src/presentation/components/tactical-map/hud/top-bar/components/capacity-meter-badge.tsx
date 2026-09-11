import React from "react";
import { useTranslations } from "next-intl";
import { Factory } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface CapacityMeterBadgeProps {
  totalActiveFactories: number;
  totalMaxSlots: number;
}

export function CapacityMeterBadge({
  totalActiveFactories,
  totalMaxSlots,
}: CapacityMeterBadgeProps) {
  const t = useTranslations("industry.capacityMeter");
  const percentage =
    totalMaxSlots > 0
      ? Math.round((totalActiveFactories / totalMaxSlots) * 100)
      : 100;

  return (
    <div
      className="flex items-center gap-2 bg-secondary/60 border border-border/80 px-3.5 py-1.5 rounded-2xl font-mono text-xs transition-all hover:bg-secondary cursor-default shrink-0 shadow-sm"
      title={t("tooltip", {
        active:
          PersianNumberFormatter.formatNumberWithCommas(totalActiveFactories),
        max: PersianNumberFormatter.formatNumberWithCommas(totalMaxSlots),
      })}
    >
      <Factory size={14} className="text-gdp shrink-0" />
      <div className="flex items-center gap-2">
        <span className="font-bold text-gdp">
          {PersianNumberFormatter.toPersianDigits(percentage)}%
        </span>
        <div className="w-10 h-1.5 bg-background/90 rounded-full overflow-hidden border border-border/60">
          <div
            className="h-full rounded-full transition-all duration-300 bg-gdp"
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
