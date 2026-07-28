import React from "react";
import { ArrowRight } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { AdvancedDiplomacyActions } from "./advanced-diplomacy-actions";
import { CountryProfileStats } from "./country-profile-stats";
import { FocusMapButton } from "./focus-map-button";

export interface DiplomaticRelation {
  code: string;
  name: string;
  flagCode: string;
  stance: "PEACE" | "WAR" | "ALLIANCE" | "NON_AGGRESSION_PACT";
  opinion: number;
  description: string;
  profileData: {
    gdp: string;
    population: string;
    techLevel: number;
    governmentType: string;
    stability: number;
    corruption: number;
    militaryStrength?: string;
  };
}

interface DiplomacyDetailViewProps {
  relation: DiplomaticRelation;
  onBack: () => void;
  onFocusCountry?: (code: string) => void;
}

export function DiplomacyDetailView({
  relation,
  onBack,
  onFocusCountry,
}: DiplomacyDetailViewProps) {
  const flagEmoji = getFlagEmoji(relation.flagCode || relation.code);

  const getStanceBadge = (stance: string) => {
    switch (stance) {
      case "WAR":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-military/15 text-military border border-military/30 text-[10px] font-bold whitespace-nowrap shrink-0">
            در حال جنگ
          </span>
        );
      case "ALLIANCE":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-gdp/15 text-gdp border border-gdp/30 text-[10px] font-bold whitespace-nowrap shrink-0">
            اتحاد کامل
          </span>
        );
      case "NON_AGGRESSION_PACT":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-treasury/15 text-treasury border border-treasury/30 text-[10px] font-bold whitespace-nowrap shrink-0">
            عدم تخاصم
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg bg-secondary border border-border/80 text-muted-foreground text-[10px] font-bold whitespace-nowrap shrink-0">
            دیپلماسی عادی
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowRight size={14} />
        <span>بازگشت به فهرست کشورها</span>
      </button>

      <div className="bg-background/40 border border-border/80 p-4 rounded-3xl space-y-4">
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="text-3xl select-none shrink-0"
              role="img"
              aria-label={relation.name}
            >
              {flagEmoji}
            </span>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-foreground truncate">
                  {relation.name}
                </h2>
                <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                  {relation.code}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono block">
                شناسنامه رسمی حاکمیت
              </span>
            </div>
          </div>

          {getStanceBadge(relation.stance)}
        </div>

        <p className="text-xs text-foreground/90 bg-secondary/30 border border-border/40 p-3.5 rounded-2xl leading-relaxed font-sans">
          {relation.description}
        </p>

        <CountryProfileStats data={relation.profileData} />

        {onFocusCountry && (
          <FocusMapButton
            countryCode={relation.code}
            countryName={relation.name}
            onFocus={onFocusCountry}
          />
        )}
      </div>

      <AdvancedDiplomacyActions targetName={relation.name} />
    </div>
  );
}
