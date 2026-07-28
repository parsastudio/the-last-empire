import React from "react";
import { Coins, Users, Shield, Landmark, AlertCircle } from "lucide-react";

export interface CountryProfileData {
  gdp: string;
  population: string;
  militaryStrength: string;
  infantry: string;
  airForce: string;
  droneMissile: string;
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
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary/40 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans">
            <Coins size={12} className="text-gdp" />
            <span>تولید ناخالص (GDP)</span>
          </div>
          <span className="font-bold text-foreground block">{data.gdp}</span>
        </div>

        <div className="bg-secondary/40 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans">
            <Users size={12} className="text-primary" />
            <span>جمعیت کل</span>
          </div>
          <span className="font-bold text-foreground block">
            {data.population}
          </span>
        </div>
      </div>

      <div className="bg-secondary/40 p-3.5 rounded-xl space-y-2">
        <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 font-sans">
            <Shield size={12} className="text-military" />
            ارتش و توان رزمی
          </span>
          <span className="text-[10px] font-bold text-amber-500 font-mono">
            فناوری: لِوِل {data.techLevel}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="bg-background/50 p-2 rounded-lg">
            <span className="text-muted-foreground block text-[9px] font-sans">
              پیاده‌نظام
            </span>
            <span className="font-bold text-foreground block">
              {data.infantry}
            </span>
          </div>
          <div className="bg-background/50 p-2 rounded-lg">
            <span className="text-muted-foreground block text-[9px] font-sans">
              جنگنده
            </span>
            <span className="font-bold text-foreground block">
              {data.airForce}
            </span>
          </div>
          <div className="bg-background/50 p-2 rounded-lg">
            <span className="text-muted-foreground block text-[9px] font-sans">
              پهپاد/موشک
            </span>
            <span className="font-bold text-foreground block">
              {data.droneMissile}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary/40 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans">
            <Landmark size={12} className="text-diplomacy" />
            <span>نظام سیاسی</span>
          </div>
          <span className="font-bold text-foreground block">
            {data.governmentType}
          </span>
        </div>

        <div className="bg-secondary/40 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans">
            <AlertCircle size={12} className="text-treasury" />
            <span>ثبات سیاسی</span>
          </div>
          <span className="font-bold text-gdp block">{data.stability}%</span>
        </div>
      </div>
    </div>
  );
}
