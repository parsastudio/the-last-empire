import React, { useEffect, useMemo } from "react";
import { Shield, Coins, Users } from "lucide-react";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { useCountryHoverMath } from "./hooks/use-country-hover-math";
import { Nation } from "@/domain/nation/nation.schema";
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
  regionArea?: string;
}

class HoverHudPositionCalculator {
  private readonly hudWidth = 288;
  private readonly hudHeight = 160;
  private readonly offset = 15;

  public calculatePosition(
    cursorPos: { x: number; y: number } | null | undefined,
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

function CountryHoverHud({
  info,
  cursorPos,
}: {
  info: HoverCountryInfo | null;
  cursorPos?: { x: number; y: number } | null;
}) {
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
      <div className="bg-card/95 backdrop-blur-2xl border border-border/80 p-4 rounded-2xl shadow-2xl shadow-black/50 space-y-3 text-foreground font-sans border-t-primary/40">
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className="text-2xl select-none"
              role="img"
              aria-label={info.name}
            >
              {flagSymbol}
            </span>
            <div>
              <h4 className="text-xs font-black text-foreground leading-none">
                {info.name}
              </h4>
              <span className="text-[9px] font-mono text-muted-foreground block mt-1">
                {info.code} {info.regionName && `| ${info.regionName}`}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold bg-secondary/80 px-2 py-0.5 rounded-lg border border-border/60 text-muted-foreground">
            رتبه: #{PersianNumberFormatter.toPersianDigits(info.rank)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 bg-secondary/50 p-2 rounded-xl border border-border/40">
            <Coins size={12} className="text-gdp shrink-0" />
            <span className="truncate">{info.gdp}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-secondary/50 p-2 rounded-xl border border-border/40">
            <Users size={12} className="text-primary shrink-0" />
            <span className="truncate">{info.regionArea || "---"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] bg-secondary/40 p-2 rounded-xl border border-border/40">
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

interface CountryHoverContainerProps {
  countries: CountryMapping[];
  maskDataRef: React.RefObject<Uint8Array | null>;
  packed1024Ref?: React.RefObject<Uint8Array | null>;
  mapWidth: number;
  mapHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  position: { x: number; y: number };
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  isDragging?: boolean;
  onHoverStateChange?: (isHovering: boolean) => void;
}

export function CountryHoverContainer({
  countries,
  maskDataRef,
  packed1024Ref,
  mapWidth,
  mapHeight,
  containerRef,
  scale,
  position,
  nationsMap,
  humanNationId,
  isDragging = false,
  onHoverStateChange,
}: CountryHoverContainerProps) {
  const { hoverData, cursorPos } = useCountryHoverMath({
    countries,
    maskDataRef,
    packed1024Ref,
    mapWidth,
    mapHeight,
    containerRef,
    scale,
    position,
    nationsMap,
    humanNationId,
    isDragging,
  });

  const isHovering = Boolean(hoverData);

  useEffect(() => {
    if (onHoverStateChange) {
      onHoverStateChange(isHovering);
    }
  }, [isHovering, onHoverStateChange]);

  return <CountryHoverHud info={hoverData} cursorPos={cursorPos} />;
}
