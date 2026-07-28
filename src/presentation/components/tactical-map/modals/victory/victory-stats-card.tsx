import React from "react";
import { Award, Globe2, Coins, Users } from "lucide-react";

interface VictoryStatsCardProps {
  turnsPlayed: number;
  finalGdp: string;
  finalPopulation: string;
  conqueredArea: string;
}

export function VictoryStatsCard({
  turnsPlayed,
  finalGdp,
  finalPopulation,
  conqueredArea,
}: VictoryStatsCardProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 font-mono text-xs dir-rtl">
      <div className="bg-secondary/40 p-3 rounded-2xl space-y-1 border border-border/40">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
          <Award size={12} className="text-amber-500" />
          <span>تعداد نوبت‌ها</span>
        </div>
        <span className="font-bold text-foreground block">{turnsPlayed}</span>
      </div>

      <div className="bg-secondary/40 p-3 rounded-2xl space-y-1 border border-border/40">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
          <Coins size={12} className="text-gdp" />
          <span>تولید ناخالص نهایی</span>
        </div>
        <span className="font-bold text-foreground block">{finalGdp}</span>
      </div>

      <div className="bg-secondary/40 p-3 rounded-2xl space-y-1 border border-border/40">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
          <Users size={12} className="text-primary" />
          <span>جمعیت کل امپراتوری</span>
        </div>
        <span className="font-bold text-foreground block">
          {finalPopulation}
        </span>
      </div>

      <div className="bg-secondary/40 p-3 rounded-2xl space-y-1 border border-border/40">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
          <Globe2 size={12} className="text-military" />
          <span>مساحت تحت کنترل</span>
        </div>
        <span className="font-bold text-foreground block">{conqueredArea}</span>
      </div>
    </div>
  );
}
