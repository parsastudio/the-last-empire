import React from "react";
import {
  Coins,
  Users,
  Award,
  Landmark,
  ShoppingCart,
  Lock,
} from "lucide-react";
import { DiplomaticPosture } from "@geopolitics/domain";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface CountryProfileData {
  gdp: string;
  population: string;
  techLevel: number;
  governmentType: string;
  stability: number;
  opinion?: number;
  alignment?: number;
  tension?: number;
  posture?: DiplomaticPosture;
}

interface CountryProfileStatsProps {
  data: CountryProfileData;
}

export function CountryProfileStats({ data }: CountryProfileStatsProps) {
  const currentOpinion = data.opinion ?? 0;
  const isArmsEligible = currentOpinion >= 20;

  return (
    <div className="space-y-3 font-mono text-xs dir-rtl font-sans">
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
            سطح فناوری دفاعی
          </span>
        </div>
        <span className="text-xs font-bold text-amber-500 font-mono bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30 whitespace-nowrap">
          سطح {PersianNumberFormatter.toPersianDigits(data.techLevel)}
        </span>
      </div>

      <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl flex items-center justify-between font-sans">
        <div className="flex items-center gap-2 text-xs">
          <ShoppingCart
            size={15}
            className={isArmsEligible ? "text-gdp" : "text-muted-foreground"}
          />
          <span className="text-muted-foreground font-bold text-[11px]">
            دسترسی بازار اسلحه:
          </span>
        </div>
        {isArmsEligible ? (
          <span className="text-[10px] font-bold text-gdp bg-gdp/15 px-2.5 py-0.5 rounded-lg border border-gdp/30">
            آماده معامله
          </span>
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-lg border border-border/60 flex items-center gap-1">
            <Lock size={10} />
            نیازمند دیدگاه ۲۰+
          </span>
        )}
      </div>

      <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl space-y-2 font-sans">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Landmark size={13} className="text-diplomacy shrink-0" />
            <span>نظام سیاسی</span>
          </div>
          <span className="text-xs font-extrabold text-foreground font-sans">
            {data.governmentType}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] text-muted-foreground font-sans">
            ثبات سیاسی داخلی:
          </span>
          <span className="font-bold text-gdp">
            {PersianNumberFormatter.toPersianDigits(data.stability)}٪
          </span>
        </div>
      </div>
    </div>
  );
}
