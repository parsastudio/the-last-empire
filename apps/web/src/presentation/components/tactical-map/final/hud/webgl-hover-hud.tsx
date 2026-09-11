"use client";

import React, { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Coins, MapPin, Landmark } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { DiplomaticStance } from "@geopolitics/domain";
import { HoverStanceBadge } from "./components/hover-stance-badge";
import { HoverHudPositionUtility } from "./utils/hover-hud-position.utility";

export interface HoverCountryInfo {
  name: string;
  code: string;
  flagCode: string;
  rank: number;
  gdpRank?: number;
  stance: string;
  rawStance?: DiplomaticStance;
  isOwnCountry: boolean;
  regionName?: string;
  regionGdpText?: string;
  totalGdpText?: string;
  gdpSharePct?: number;
  hasSecurityGuarantee?: boolean;
}

interface WebGLHoverHudProps {
  hudRef: React.RefObject<HTMLDivElement | null>;
  hoverData: HoverCountryInfo | null;
}

export function WebGLHoverHud({ hudRef, hoverData }: WebGLHoverHudProps) {
  const t = useTranslations("map.hud");
  const locale = useLocale();
  const isRtl = locale === "fa";

  useEffect(() => {
    if (hoverData && hudRef.current) {
      HoverHudPositionUtility.reapplyLastPosition(hudRef.current);
    }
  }, [hoverData, hudRef]);

  if (!hoverData) return null;

  const flagSymbol = getFlagEmoji(hoverData.flagCode || hoverData.code);

  return (
    <div
      ref={hudRef}
      className={`fixed z-50 pointer-events-none w-80 animate-fade-smooth text-start ${
        isRtl ? "dir-rtl" : "dir-ltr"
      }`}
      style={{
        left: HoverHudPositionUtility.getLastLeft(),
        top: HoverHudPositionUtility.getLastTop(),
      }}
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
                {t("worldRank", {
                  rank: PersianNumberFormatter.toPersianDigits(hoverData.rank),
                })}
              </span>
            </div>
          </div>

          <div>
            <HoverStanceBadge
              isOwnCountry={hoverData.isOwnCountry}
              hasSecurityGuarantee={hoverData.hasSecurityGuarantee}
              rawStance={hoverData.rawStance}
            />
          </div>
        </div>

        {hoverData.regionName && (
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between px-0.5 font-sans">
              <span className="text-primary font-bold flex items-center gap-1 text-[11px]">
                <MapPin size={11} />
                {hoverData.regionName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-secondary/40 border border-border/60 p-2 rounded-xl space-y-0.5">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-sans">
                  <Coins size={11} className="text-gdp" />
                  <span>{t("provinceEconomy")}</span>
                </div>
                <span className="text-xs font-black text-gdp block truncate">
                  {hoverData.regionGdpText}
                </span>
                {hoverData.gdpSharePct !== undefined && (
                  <span className="text-[8px] text-muted-foreground block font-sans">
                    {t("gdpShare", {
                      pct: PersianNumberFormatter.toPersianDigits(
                        hoverData.gdpSharePct,
                      ),
                    })}
                  </span>
                )}
              </div>

              <div className="bg-secondary/40 border border-border/60 p-2 rounded-xl space-y-0.5">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-sans">
                  <Landmark size={11} className="text-primary" />
                  <span>{t("countryGdp")}</span>
                </div>
                <span className="text-xs font-black text-foreground block truncate">
                  {hoverData.totalGdpText}
                </span>
                <span className="text-[8px] text-muted-foreground block font-sans">
                  {t("gdpRank", {
                    rank: PersianNumberFormatter.toPersianDigits(
                      hoverData.gdpRank ?? hoverData.rank,
                    ),
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
