import React from "react";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";
import { useNationHeaderFormatter } from "./hooks/use-nation-header-formatter";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getGovernmentTypeLabel } from "@/domain/politics/government-label.utility";

interface NationHeaderCardProps {
  name: string;
  code: string;
  flagCode: string;
  governmentType: string;
  population: number;
  territorySize?: number;
  rank?: number;
  regions?: RegionDemographics[];
}

export function NationHeaderCard({
  name,
  code,
  flagCode,
  governmentType,
  population,
  territorySize,
  rank = 1,
}: NationHeaderCardProps) {
  const formatted = useNationHeaderFormatter({
    code,
    flagCode,
    population,
    territorySize,
  });

  return (
    <div className="bg-background/60 border border-border/80 p-4 rounded-2xl flex flex-col gap-3 shadow-inner dir-rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="text-3xl select-none shrink-0"
            role="img"
            aria-label={name}
          >
            {formatted.flagEmoji}
          </span>
          <div className="space-y-0.5 text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground">
                {name}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              نوع حکومت: {getGovernmentTypeLabel(governmentType)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-xl">
          <span className="text-sm">🏆</span>
          <span className="text-xs font-extrabold font-mono text-amber-500">
            رتبه {PersianNumberFormatter.toPersianDigits(rank)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-right font-mono">
        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
          <span className="text-[9px] text-muted-foreground block">
            جمعیت کل قلمروها
          </span>
          <span className="text-xs font-bold text-foreground block font-mono">
            {formatted.formattedPopulation} نفر
          </span>
        </div>
        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
          <span className="text-[9px] text-muted-foreground block">
            مساحت کل
          </span>
          <span className="text-xs font-bold text-foreground block font-mono">
            {formatted.formattedArea} km²
          </span>
        </div>
      </div>
    </div>
  );
}
