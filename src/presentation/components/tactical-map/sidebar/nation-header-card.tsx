import React from "react";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import {
  findCountryProfileById,
  findCountryProfileByCode,
} from "@/domain/map/countries";

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
  const flagEmoji = getFlagEmoji(flagCode || code);

  let realTerritory = territorySize && territorySize > 0 ? territorySize : 0;
  if (!realTerritory) {
    const numericId = parseInt(code.replace("NATION_", ""), 10);
    const profile = !isNaN(numericId)
      ? findCountryProfileById(numericId)
      : findCountryProfileByCode(code);
    realTerritory = profile ? Math.round(profile.gdp / 1000000) : 377975;
  }

  const formattedArea = Math.round(realTerritory).toLocaleString("fa-IR");

  let formattedPopulation = (population / 1e6).toFixed(1);
  if (population >= 1e9) {
    formattedPopulation = `${(population / 1e9).toFixed(2)} میلیارد`;
  } else {
    formattedPopulation = `${formattedPopulation} میلیون`;
  }

  return (
    <div className="bg-background/60 border border-border/80 p-4 rounded-2xl flex flex-col gap-3 shadow-inner dir-rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="text-3xl select-none shrink-0"
            role="img"
            aria-label={name}
          >
            {flagEmoji}
          </span>
          <div className="space-y-0.5 text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground">
                {name}
              </span>
              <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                {code}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              نوع حکومت: {governmentType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-xl">
          <span className="text-sm">🏆</span>
          <span className="text-xs font-extrabold font-mono text-amber-500">
            رتبه {rank}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-right font-mono">
        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
          <span className="text-[9px] text-muted-foreground block">
            جمعیت کل قلمروها
          </span>
          <span className="text-xs font-bold text-foreground block font-mono">
            {formattedPopulation} نفر
          </span>
        </div>
        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5">
          <span className="text-[9px] text-muted-foreground block">
            مساحت کل
          </span>
          <span className="text-xs font-bold text-foreground block font-mono">
            {formattedArea} km²
          </span>
        </div>
      </div>
    </div>
  );
}
