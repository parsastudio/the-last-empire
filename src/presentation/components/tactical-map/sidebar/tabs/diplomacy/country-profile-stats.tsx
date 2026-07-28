import React from "react";
import {
  Coins,
  Users,
  Award,
  Landmark,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export interface CountryProfileData {
  gdp: string;
  population: string;
  techLevel: number;
  governmentType: string;
  stability: number;
  corruption: number;
}

interface CountryProfileStatsProps {
  data: CountryProfileData;
}

export function CountryProfileStats({ data }: CountryProfileStatsProps) {
  return (
    <div className="space-y-3 font-mono text-xs dir-rtl">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans">
            <Coins size={13} className="text-gdp shrink-0" />
            <span className="whitespace-nowrap">تولید ناخالص (GDP)</span>
          </div>
          <span className="text-xs font-bold text-foreground block font-mono">
            {data.gdp}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans">
            <Users size={13} className="text-primary shrink-0" />
            <span className="whitespace-nowrap">جمعیت کل</span>
          </div>
          <span className="text-xs font-bold text-foreground block font-mono">
            {data.population}
          </span>
        </div>
      </div>

      <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2 font-sans text-xs">
          <Award size={16} className="text-amber-500 shrink-0" />
          <span className="text-muted-foreground font-bold text-[11px] whitespace-nowrap">
            سطح فناوری نظامی و دفاعی
          </span>
        </div>
        <span className="text-xs font-bold text-amber-500 font-mono bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30 whitespace-nowrap">
          لِوِل {data.techLevel}
        </span>
      </div>

      <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl space-y-3 font-sans">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Landmark size={13} className="text-diplomacy shrink-0" />
            <span>نظام سیاسی</span>
          </div>
          <span className="text-xs font-extrabold text-foreground font-sans whitespace-nowrap">
            {data.governmentType}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <div className="bg-background/60 border border-border/40 p-2.5 rounded-xl space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
              <AlertCircle size={12} className="text-gdp shrink-0" />
              <span>ثبات سیاسی</span>
            </div>
            <span className="font-bold text-gdp block text-xs">
              {data.stability}%
            </span>
          </div>

          <div className="bg-background/60 border border-border/40 p-2.5 rounded-xl space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans">
              <ShieldAlert size={12} className="text-military shrink-0" />
              <span>شاخص فساد</span>
            </div>
            <span className="font-bold text-military block text-xs">
              {data.corruption}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
