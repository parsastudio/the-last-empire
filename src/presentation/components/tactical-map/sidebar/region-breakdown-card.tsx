import React from "react";
import { Globe, Users, Coins } from "lucide-react";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";

interface RegionBreakdownCardProps {
  regions?: RegionDemographics[];
}

export function RegionBreakdownCard({ regions }: RegionBreakdownCardProps) {
  if (!regions || regions.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Globe size={13} className="text-primary" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تفکیک قلمروها و مناطق فرامرزی
        </span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        {regions.map((reg) => (
          <div
            key={reg.regionId}
            className="bg-background/40 border border-border/60 p-3 rounded-xl flex items-center justify-between"
          >
            <div className="space-y-0.5 text-right">
              <span className="text-xs font-bold text-foreground block">
                {reg.name}
              </span>
              <span className="text-[9px] text-muted-foreground block">
                مساحت: {reg.areaSqKm.toLocaleString("fa-IR")} km²
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users size={11} className="text-primary" />
                <span>{(reg.population / 1e6).toFixed(1)}M</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Coins size={11} className="text-gdp" />
                <span>${(reg.gdp / 1e9).toFixed(1)}B</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
