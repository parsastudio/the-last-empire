import React from "react";
import { Globe, Users, Coins, MapPin } from "lucide-react";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface RegionBreakdownCardProps {
  regions?: RegionDemographics[];
  nationName?: string;
  totalArea?: number;
  totalPopulation?: number;
  totalGdp?: number;
}

export function RegionBreakdownCard({
  regions,
  nationName = "این کشور",
  totalArea = 0,
  totalPopulation = 0,
  totalGdp = 0,
}: RegionBreakdownCardProps) {
  const effectiveRegions: RegionDemographics[] =
    regions && regions.length > 0
      ? regions
      : [
          {
            regionId: 0,
            name: `خاک اصلی ${nationName}`,
            pixelCount: 0,
            areaSqKm: totalArea,
            population: totalPopulation,
            gdp: totalGdp,
          },
        ];

  return (
    <div className="space-y-3 dir-rtl text-right">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-primary" />
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
            تفکیک قلمروها و مناطق فرامرزی
          </span>
        </div>
        <span className="text-[9px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
          {PersianNumberFormatter.toPersianDigits(effectiveRegions.length)}{" "}
          اقلیم
        </span>
      </div>

      <div className="space-y-2.5 font-mono text-xs max-h-60 overflow-y-auto pr-1 scrollbar-thin">
        {effectiveRegions.map((reg) => {
          const formattedArea = PersianNumberFormatter.toPersianDigits(
            Math.round(reg.areaSqKm).toLocaleString("en-US"),
          );
          const formattedPop = PersianNumberFormatter.formatCompactNumber(
            reg.population,
          );
          const formattedGdp = PersianNumberFormatter.formatCurrency(
            reg.gdp,
            true,
          );

          return (
            <div
              key={reg.regionId}
              className="bg-background/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-inner"
            >
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span className="text-xs font-bold text-foreground block font-sans">
                    {reg.name}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground block font-sans">
                  مساحت: {formattedArea} km²
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-[10px]">
                <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-xl border border-border/50">
                  <Users size={12} className="text-primary shrink-0" />
                  <span>{formattedPop}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-xl border border-border/50">
                  <Coins size={12} className="text-gdp shrink-0" />
                  <span>{formattedGdp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
