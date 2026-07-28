import React from "react";
import { Shield, Award } from "lucide-react";
import { HoverCountryInfo } from "./country-hover-container";

interface CountryHoverHudProps {
  info: HoverCountryInfo | null;
}

export function CountryHoverHud({ info }: CountryHoverHudProps) {
  if (!info) {
    return (
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="bg-card/60 backdrop-blur-md border border-border/60 px-4 py-2 rounded-2xl shadow-sm text-[10px] font-mono text-muted-foreground">
          نشانگر ماوس را روی یکی از قلمروهای نقشه ببرید...
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-150 ease-out animate-in fade-in slide-in-from-top-4"
      dir="rtl"
    >
      <div className="bg-card/90 backdrop-blur-xl border border-border/80 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/flags/${info.flagCode.toLowerCase()}.png`}
          alt={info.name}
          className="w-10 h-7 object-cover rounded-lg shadow-sm border border-border shrink-0"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
        <div className="flex-1 flex items-center justify-between gap-6 font-mono">
          <div className="space-y-0.5 text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground font-sans">
                {info.name}
              </span>
              <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                {info.code}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Award size={11} className="text-amber-500" />
                رتبه: {info.rank}
              </span>
              <span className="flex items-center gap-1">
                <Shield size={11} className="text-diplomacy" />
                {info.gdp}
              </span>
            </div>
          </div>

          <div className="text-left text-[10px] border-r border-border/80 pr-4">
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
