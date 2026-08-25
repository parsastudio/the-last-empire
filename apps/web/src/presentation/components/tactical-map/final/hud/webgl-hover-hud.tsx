import React from "react";
import {
  Users,
  Coins,
  MapPin,
  Building2,
  Swords,
  CheckCircle2,
  Handshake,
  Globe,
  Crown,
} from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { DiplomaticStance } from "@geopolitics/domain";

export interface HoverCountryInfo {
  name: string;
  code: string;
  flagCode: string;
  rank: number;
  stance: string;
  rawStance?: DiplomaticStance;
  isOwnCountry: boolean;
  regionName?: string;
  regionPopulationText?: string;
  regionGdpText?: string;
  regionCapacityPercentage?: number;
  totalPopulationText?: string;
  totalGdpText?: string;
  popSharePct?: number;
  gdpSharePct?: number;
}

function calculateHudPosition(
  cursorPos: { x: number; y: number } | null,
): React.CSSProperties {
  if (!cursorPos || typeof window === "undefined") {
    return { left: "1.5rem", bottom: "1.5rem" };
  }

  const hudWidth = 340;
  const hudHeight = 180;
  const offset = 16;

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

  const renderStanceBadge = () => {
    if (hoverData.isOwnCountry) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-gdp/15 text-gdp border border-gdp/30 px-2 py-0.5 rounded-lg shadow-sm">
          <Crown size={11} />
          <span>امپراتوری شما</span>
        </span>
      );
    }

    switch (hoverData.rawStance) {
      case "WAR":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded-lg shadow-sm animate-pulse">
            <Swords size={11} />
            <span>وضعیت نبرد</span>
          </span>
        );
      case "ALLIANCE":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-gdp/20 text-gdp border border-gdp/35 px-2 py-0.5 rounded-lg shadow-sm">
            <CheckCircle2 size={11} />
            <span>اتحاد کامل</span>
          </span>
        );
      case "NON_AGGRESSION_PACT":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-amber-500/20 text-amber-400 border border-amber-500/35 px-2 py-0.5 rounded-lg shadow-sm">
            <Handshake size={11} />
            <span>عدم تخاصم</span>
          </span>
        );
      case "NORMAL_DIPLOMACY":
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-secondary/80 text-muted-foreground border border-border/70 px-2 py-0.5 rounded-lg shadow-sm">
            <Globe size={11} />
            <span>دیپلماسی عادی</span>
          </span>
        );
    }
  };

  return (
    <div
      className="fixed z-50 pointer-events-none w-84 animate-fade-smooth dir-rtl text-right"
      style={stylePosition}
    >
      <div className="bg-card/95 backdrop-blur-2xl border border-border/80 p-3.5 rounded-2xl shadow-2xl space-y-2.5 text-foreground font-sans">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2.5">
            <span
              className="text-2xl select-none"
              role="img"
              aria-label={hoverData.name}
            >
              {flagSymbol}
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-foreground leading-none">
                  {hoverData.name}
                </h4>
                <span className="text-[9px] font-mono text-muted-foreground font-bold">
                  {hoverData.code}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-amber-500 block">
                رتبه جهانی: #
                {PersianNumberFormatter.toPersianDigits(hoverData.rank)}
              </span>
            </div>
          </div>

          <div>{renderStanceBadge()}</div>
        </div>

        {hoverData.regionName && (
          <div className="bg-secondary/40 border border-border/60 p-2.5 rounded-xl space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between pb-1.5 border-b border-border/40 font-sans">
              <span className="text-primary font-bold flex items-center gap-1 text-xs">
                <MapPin size={12} />
                {hoverData.regionName}
              </span>
              {hoverData.regionCapacityPercentage !== undefined && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                  <Building2 size={11} className="text-treasury" />
                  {PersianNumberFormatter.toPersianDigits(
                    hoverData.regionCapacityPercentage,
                  )}
                  ٪ اشغال مسکن
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
                  <Users size={12} className="text-primary" />
                  جمعیت:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground">
                    {hoverData.regionPopulationText}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-sans">
                    از کل {hoverData.totalPopulationText}
                  </span>
                  {hoverData.popSharePct !== undefined && (
                    <span className="text-[9px] bg-secondary/80 px-1 py-0.5 rounded text-primary font-bold">
                      {PersianNumberFormatter.toPersianDigits(
                        hoverData.popSharePct,
                      )}
                      ٪
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
                  <Coins size={12} className="text-gdp" />
                  تولید GDP:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gdp">
                    {hoverData.regionGdpText}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-sans">
                    از کل {hoverData.totalGdpText}
                  </span>
                  {hoverData.gdpSharePct !== undefined && (
                    <span className="text-[9px] bg-secondary/80 px-1 py-0.5 rounded text-gdp font-bold">
                      {PersianNumberFormatter.toPersianDigits(
                        hoverData.gdpSharePct,
                      )}
                      ٪
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
