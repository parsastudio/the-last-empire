import React, { useMemo } from "react";
import {
  Coins,
  Users,
  Award,
  Landmark,
  ShoppingCart,
  Lock,
  ShieldCheck,
  Skull,
  Cpu,
} from "lucide-react";
import {
  PersianNumberFormatter,
  StabilityBracketUtility,
} from "@geopolitics/domain";
import { DiplomacyAlliesBox } from "@/presentation/components/tactical-map/command-center/views/components/diplomacy-allies-box";
import { NationAllyDetail } from "@/presentation/components/tactical-map/command-center/views/components/diplomacy-allies-resolver.utility";

export interface CountryProfileData {
  gdp: string;
  population: string;
  techLevel: number;
  industrialLevel: number;
  governmentType: string;
  stability: number;
  tension: number;
  guarantorName?: string;
  isEmergencyProtectorate?: boolean;
  isArmsEligible?: boolean;
}

interface CountryProfileStatsProps {
  data: CountryProfileData;
  allies?: NationAllyDetail[];
  onSelectAlly?: (code: string) => void;
}

export function CountryProfileStats({
  data,
  allies = [],
  onSelectAlly,
}: CountryProfileStatsProps) {
  const isArmsEligible = data.isArmsEligible ?? data.tension < 50;
  const bracket = useMemo(
    () => StabilityBracketUtility.getBracket(data.stability),
    [data.stability],
  );

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

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 font-sans text-xs">
            <Award size={15} className="text-amber-500 shrink-0" />
            <span className="text-muted-foreground font-bold text-[10px] whitespace-nowrap">
              فناوری نظامی
            </span>
          </div>
          <span className="text-xs font-bold text-amber-500 font-mono block">
            سطح{" "}
            {PersianNumberFormatter.toPersianDigits(data.techLevel.toFixed(1))}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 font-sans text-xs">
            <Cpu size={15} className="text-primary shrink-0" />
            <span className="text-muted-foreground font-bold text-[10px] whitespace-nowrap">
              فناوری صنعتی (R&D)
            </span>
          </div>
          <span className="text-xs font-bold text-primary font-mono block">
            سطح{" "}
            {PersianNumberFormatter.toPersianDigits(
              data.industrialLevel.toFixed(1),
            )}
          </span>
        </div>
      </div>

      <DiplomacyAlliesBox allies={allies} onSelectAlly={onSelectAlly} />

      {data.guarantorName && (
        <div
          className={`p-3 rounded-2xl flex items-center justify-between font-sans border ${
            data.isEmergencyProtectorate
              ? "bg-rose-950/20 border-rose-500/40"
              : "bg-cyan-950/20 border-cyan-500/40"
          }`}
        >
          <div
            className={`flex items-center gap-1.5 text-xs ${
              data.isEmergencyProtectorate ? "text-rose-300" : "text-cyan-300"
            }`}
          >
            {data.isEmergencyProtectorate ? (
              <Skull
                size={14}
                className="text-rose-400 shrink-0 animate-pulse"
              />
            ) : (
              <ShieldCheck size={14} className="text-cyan-400 shrink-0" />
            )}
            <span className="text-[11px] font-bold">
              {data.isEmergencyProtectorate
                ? "معاهده تحت‌الحمایگی استعماری:"
                : "چتر امنیتی فعال:"}
            </span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
              data.isEmergencyProtectorate
                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
            }`}
          >
            تحت {data.isEmergencyProtectorate ? "الحاق و استعمار" : "حمایت"}{" "}
            {data.guarantorName}
          </span>
        </div>
      )}

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
            {data.tension >= 50 ? "تنش بالای ۵۰٪" : "عدم برتری فناوری"}
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
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${bracket.badgeStyleClass}`}
            >
              {bracket.labelFa}
            </span>
            <span className={`font-bold ${bracket.textColorClass}`}>
              {PersianNumberFormatter.toPersianDigits(data.stability)}٪
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
