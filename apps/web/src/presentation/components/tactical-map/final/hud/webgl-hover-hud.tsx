import React from "react";
import {
  Coins,
  MapPin,
  Building2,
  Swords,
  CheckCircle2,
  Handshake,
  Globe,
  Crown,
  Landmark,
  ShieldCheck,
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
  regionGdpText?: string;
  regionCapacityPercentage?: number;
  totalGdpText?: string;
  gdpSharePct?: number;
  hasSecurityGuarantee?: boolean;
}

function calculateHudPosition(
  cursorPos: { x: number; y: number } | null,
): React.CSSProperties {
  if (!cursorPos || typeof window === "undefined") {
    return { left: "1.5rem", bottom: "1.5rem" };
  }

  const hudWidth = 320;
  const hudHeight = 145;
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

    if (hoverData.hasSecurityGuarantee) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded-lg shadow-sm">
          <ShieldCheck size={11} />
          <span>چتر امنیتی</span>
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
      case "STRATEGIC_PARTNERSHIP":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-gdp/20 text-gdp border border-gdp/35 px-2 py-0.5 rounded-lg shadow-sm">
            <CheckCircle2 size={11} />
            <span>شراکت استراتژیک</span>
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
      className="fixed z-50 pointer-events-none w-80 animate-fade-smooth dir-rtl text-right"
      style={stylePosition}
    >
      <div className="bg-card/95 backdrop-blur-2xl border border-border/80 p-3 rounded-2xl shadow-2xl space-y-2 text-foreground font-sans">
        <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
          <div className="flex items-center gap-2">
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
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between px-0.5 font-sans">
              <span className="text-primary font-bold flex items-center gap-1 text-[11px]">
                <MapPin size={11} />
                {hoverData.regionName}
              </span>
              {hoverData.regionCapacityPercentage !== undefined && (
                <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 font-mono bg-secondary/80 px-1.5 py-0.5 rounded-md border border-border/40">
                  <Building2 size={10} className="text-treasury" />
                  {PersianNumberFormatter.toPersianDigits(
                    hoverData.regionCapacityPercentage,
                  )}
                  ٪ اشغال مسکن
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-secondary/40 border border-border/60 p-2 rounded-xl space-y-0.5">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-sans">
                  <Coins size={11} className="text-gdp" />
                  <span>اقتصاد این استان:</span>
                </div>
                <span className="text-xs font-black text-gdp block truncate">
                  {hoverData.regionGdpText}
                </span>
                {hoverData.gdpSharePct !== undefined && (
                  <span className="text-[8px] text-muted-foreground block font-sans">
                    {PersianNumberFormatter.toPersianDigits(
                      hoverData.gdpSharePct,
                    )}
                    ٪ از کل تولید ملی
                  </span>
                )}
              </div>

              <div className="bg-secondary/40 border border-border/60 p-2 rounded-xl space-y-0.5">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-sans">
                  <Landmark size={11} className="text-primary" />
                  <span>GDP کل کشور:</span>
                </div>
                <span className="text-xs font-black text-foreground block truncate">
                  {hoverData.totalGdpText}
                </span>
                <span className="text-[8px] text-muted-foreground block font-sans">
                  رتبه #{PersianNumberFormatter.toPersianDigits(hoverData.rank)}{" "}
                  اقتصاد جهان
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
