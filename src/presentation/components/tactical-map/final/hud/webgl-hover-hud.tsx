import React, { useMemo } from "react";
import { Shield, Coins, Users } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface HoverCountryInfo {
  name: string;
  code: string;
  flagCode: string;
  rank: number;
  stance: string;
  gdp: string;
  regionName?: string;
  regionPixels?: string;
}

class HoverHudPositionCalculator {
  private readonly hudWidth = 288;
  private readonly hudHeight = 160;
  private readonly offset = 15;

  public calculatePosition(
    cursorPos: { x: number; y: number } | null,
  ): React.CSSProperties {
    if (!cursorPos || typeof window === "undefined") {
      return { left: "1.5rem", bottom: "1.5rem" };
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = cursorPos.x + this.offset;
    let top = cursorPos.y + this.offset;

    if (left + this.hudWidth > windowWidth - 20) {
      left = Math.max(10, cursorPos.x - this.hudWidth - this.offset);
    }

    if (top + this.hudHeight > windowHeight - 20) {
      top = Math.max(10, cursorPos.y - this.hudHeight - this.offset);
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  }
}

interface WebGLHoverHudProps {
  hoverPos: { x: number; y: number } | null;
  hoverData: HoverCountryInfo | null;
}

export function WebGLHoverHud({ hoverPos, hoverData }: WebGLHoverHudProps) {
  const calculator = useMemo(() => new HoverHudPositionCalculator(), []);

  if (!hoverPos || !hoverData) return null;

  const flagSymbol = getFlagEmoji(hoverData.flagCode || hoverData.code);
  const stylePosition = calculator.calculatePosition(hoverPos);

  return (
    <div
      className="fixed z-50 pointer-events-none w-72 animate-fade-smooth dir-rtl text-right"
      style={stylePosition}
    >
      <div className="bg-card/90 backdrop-blur-xl border border-border/80 p-3.5 rounded-2xl shadow-2xl space-y-2.5 text-foreground font-sans">
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
                {hoverData.code}{" "}
                {hoverData.regionName && `| ${hoverData.regionName}`}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-lg border border-border/60">
            رتبه: #{PersianNumberFormatter.toPersianDigits(hoverData.rank)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 bg-secondary/40 p-2 rounded-xl border border-border/40">
            <Coins size={12} className="text-gdp shrink-0" />
            <span className="truncate">{hoverData.gdp}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-secondary/40 p-2 rounded-xl border border-border/40">
            <Users size={12} className="text-primary shrink-0" />
            <span className="truncate">{hoverData.regionPixels || "---"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] bg-secondary/30 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground flex items-center gap-1">
            <Shield size={11} className="text-diplomacy" />
            وضعیت سیاسی:
          </span>
          <span className="font-bold text-foreground">{hoverData.stance}</span>
        </div>
      </div>
    </div>
  );
}
