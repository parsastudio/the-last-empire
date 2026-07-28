import React from "react";
import { Shield, Award } from "lucide-react";
import { HoverCountryInfo } from "./country-hover-container";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface CountryHoverHudProps {
  info: HoverCountryInfo | null;
}

export function CountryHoverHud({ info }: CountryHoverHudProps) {
  if (!info) {
    return null;
  }

  const flagSymbol = getFlagEmoji(info.flagCode || info.code);

  return (
    <div
      className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-[360px] animate-fade-smooth"
      dir="rtl"
    >
      <div className="bg-card/90 backdrop-blur-xl border border-border/80 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 w-full">
        <span
          className="text-2xl select-none shrink-0"
          role="img"
          aria-label={info.name}
        >
          {flagSymbol}
        </span>
        <div className="flex-1 flex items-center justify-between gap-4 font-mono">
          <div className="space-y-0.5 text-right overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground font-sans truncate">
                {info.name}
              </span>
              <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                {info.code}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1 shrink-0">
                <Award size={11} className="text-amber-500" />
                رتبه: {info.rank}
              </span>
              <span className="flex items-center gap-1 truncate">
                <Shield size={11} className="text-diplomacy shrink-0" />
                <span className="truncate">{info.gdp}</span>
              </span>
            </div>
          </div>

          <div className="text-left text-[10px] border-r border-border/80 pr-3 shrink-0">
            <span className="text-muted-foreground block text-[9px]">
              وضعیت
            </span>
            <span className="font-bold text-foreground">{info.stance}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
