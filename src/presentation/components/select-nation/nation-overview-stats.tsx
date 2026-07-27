import React from "react";
import { Award, Coins, Users, Landmark } from "lucide-react";
import { NationDetail } from "./nation-list-item";

interface NationOverviewStatsProps {
  nation: NationDetail;
}

export function NationOverviewStats({ nation }: NationOverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-background/50 border border-border/80 p-4 rounded-2xl space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <Award size={13} className="text-amber-500" />
          <span>رتبه قدرت جهانی</span>
        </div>
        <span className="text-base font-bold text-foreground font-mono">
          #{nation.rank}
        </span>
      </div>
      <div className="bg-background/50 border border-border/80 p-4 rounded-2xl space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <Coins size={13} className="text-gdp" />
          <span>تولید ناخالص (GDP)</span>
        </div>
        <span className="text-base font-bold text-foreground font-mono">
          {nation.gdp}
        </span>
      </div>
      <div className="bg-background/50 border border-border/80 p-4 rounded-2xl space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <Users size={13} className="text-primary" />
          <span>جمعیت کل</span>
        </div>
        <span className="text-base font-bold text-foreground font-mono">
          {nation.population}
        </span>
      </div>
      <div className="bg-background/50 border border-border/80 p-4 rounded-2xl space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <Landmark size={13} className="text-treasury" />
          <span>خزانه اولیه ملی</span>
        </div>
        <span className="text-base font-bold text-foreground font-mono">
          {nation.treasury}
        </span>
      </div>
    </div>
  );
}
