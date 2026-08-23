import React from "react";
import { Shield, Users, Coins, MapPin, Building2 } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface HoverCountryInfo {
  name: string;
  code: string;
  flagCode: string;
  rank: number;
  stance: string;
  regionName?: string;
  regionPopulation?: string;
  regionGdpText?: string;
  regionCapacityPercentage?: number;
  totalPopulation?: string;
  gdpText?: string;
}

function calculateHudPosition(
  cursorPos: { x: number; y: number } | null,
): React.CSSProperties {
  if (!cursorPos || typeof window === "undefined") {
    return { left: "1.5rem", bottom: "1.5rem" };
  }

  const hudWidth = 300;
  const hudHeight = 220;
  const offset = 15;

  let left = cursorPos.x + offset;
  let top = cursorPos.y + offset;

  if (left + hudWidth > window.innerWidth - 20) {
    left = Math.max(10, cursorPos.x - hudWidth - offset);
  }

  if (top + hudHeight > window.innerHeight - 20) {
    top = Math.max(10, cursorPos.y - hudHeight - offset);
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
  };
}

interface WebGLHoverHudProps {
  hoverPos: { x: number; y: number } | null;
  hoverData: HoverCountryInfo | null;
}

export function WebGLHoverHud({ hoverPos, hoverData }: WebGLHoverHudProps) {
  if (!hoverPos || !hoverData) return null;

  const flagSymbol = getFlagEmoji(hoverData.flagCode || hoverData.code);
  const stylePosition = calculateHudPosition(hoverPos);

  return (
    <div
      className="fixed z-50 pointer-events-none w-76 animate-fade-smooth dir-rtl text-right"
      style={stylePosition}
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border/80 p-3.5 rounded-2xl shadow-2xl space-y-2.5 text-foreground font-sans">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-xl select-none"
              role="img"
              aria-label={hoverData.name}
            >
              {flagSymbol}
            </span>
            <div>
              <h4 className="text-xs font-extrabold text-foreground leading-none">
                {hoverData.name}
              </h4>
              <span className="text-[9px] font-mono text-muted-foreground block mt-0.5">
                {hoverData.code}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-lg border border-border/60">
            رتبه: #{PersianNumberFormatter.toPersianDigits(hoverData.rank)}
          </span>
        </div>

        {hoverData.regionName && (
          <div className="bg-secondary/60 border border-primary/30 p-2 rounded-xl space-y-1.5 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-primary font-bold font-sans flex items-center gap-1 text-[10px]">
                <MapPin size={11} />
                {hoverData.regionName}
              </span>
              {hoverData.regionCapacityPercentage !== undefined && (
                <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                  <Building2 size={10} className="text-treasury" />
                  {PersianNumberFormatter.toPersianDigits(
                    hoverData.regionCapacityPercentage,
                  )}
                  ٪ اشغال
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <div className="bg-background/60 p-1.5 rounded-lg border border-border/40">
                <span className="text-muted-foreground block font-sans text-[8px]">
                  جمعیت استان:
                </span>
                <span className="font-bold text-foreground block">
                  {hoverData.regionPopulation || "---"}
                </span>
              </div>
              <div className="bg-background/60 p-1.5 rounded-lg border border-border/40">
                <span className="text-muted-foreground block font-sans text-[8px]">
                  تولید ناخالص استان:
                </span>
                <span className="font-bold text-gdp block">
                  {hoverData.regionGdpText || "---"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="flex flex-col gap-1 bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground text-[9px] font-sans flex items-center gap-1">
              <Users size={11} className="text-primary shrink-0" />
              جمعیت کل کشور:
            </span>
            <span className="font-bold text-foreground truncate">
              {hoverData.totalPopulation || "---"}
            </span>
          </div>

          <div className="flex flex-col gap-1 bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground text-[9px] font-sans flex items-center gap-1">
              <Coins size={11} className="text-gdp shrink-0" />
              GDP کل کشور:
            </span>
            <span className="font-bold text-gdp truncate">
              {hoverData.gdpText || "---"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] bg-secondary/30 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground flex items-center gap-1">
            <Shield size={11} className="text-diplomacy" />
            وضعیت دیپلماتیک:
          </span>
          <span className="font-bold text-foreground">{hoverData.stance}</span>
        </div>
      </div>
    </div>
  );
}
