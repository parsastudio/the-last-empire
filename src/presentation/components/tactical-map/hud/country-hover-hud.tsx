import React, { useMemo } from "react";
import { Shield, Coins, Users } from "lucide-react";
import { HoverCountryInfo } from "./country-hover-container";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { HoverHudPositionCalculator } from "./utils/hover-hud-position.calculator";

interface CountryHoverHudProps {
  info: HoverCountryInfo | null;
  cursorPos?: { x: number; y: number } | null;
}

export function CountryHoverHud({ info, cursorPos }: CountryHoverHudProps) {
  const calculator = useMemo(() => new HoverHudPositionCalculator(), []);

  if (!info) {
    return null;
  }

  const flagSymbol = getFlagEmoji(info.flagCode || info.code);
  const stylePosition = calculator.calculatePosition(cursorPos);

  return (
    <div
      className="fixed z-40 pointer-events-none w-72 animate-fade-smooth dir-rtl text-right"
      style={stylePosition}
    >
      <div className="bg-card/90 backdrop-blur-xl border border-border/80 p-3.5 rounded-2xl shadow-2xl space-y-2.5 text-foreground font-sans">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-xl select-none"
              role="img"
              aria-label={info.name}
            >
              {flagSymbol}
            </span>
            <div>
              <h4 className="text-xs font-extrabold text-foreground leading-none">
                {info.name}
              </h4>
              <span className="text-[9px] font-mono text-muted-foreground block mt-0.5">
                {info.code} {info.regionName && `| ${info.regionName}`}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-lg border border-border/60">
            رتبه: #{info.rank}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 bg-secondary/40 p-2 rounded-xl border border-border/40">
            <Coins size={12} className="text-gdp shrink-0" />
            <span className="truncate">{info.gdp}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-secondary/40 p-2 rounded-xl border border-border/40">
            <Users size={12} className="text-primary shrink-0" />
            <span className="truncate">{info.regionArea || "---"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] bg-secondary/30 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground flex items-center gap-1">
            <Shield size={11} className="text-diplomacy" />
            وضعیت سیاسی:
          </span>
          <span className="font-bold text-foreground">{info.stance}</span>
        </div>
      </div>
    </div>
  );
}
