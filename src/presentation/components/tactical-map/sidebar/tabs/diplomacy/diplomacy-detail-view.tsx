import React from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { DiplomacyActionButtons } from "./diplomacy-action-buttons";
import {
  CountryProfileStats,
  CountryProfileData,
} from "./country-profile-stats";

export interface DiplomaticRelation {
  code: string;
  name: string;
  stance: "PEACE" | "WAR" | "ALLIANCE" | "NON_AGGRESSION_PACT";
  opinion: number;
  description: string;
  profileData: CountryProfileData;
}

interface DiplomacyDetailViewProps {
  relation: DiplomaticRelation;
  onBack: () => void;
}

export function DiplomacyDetailView({
  relation,
  onBack,
}: DiplomacyDetailViewProps) {
  const getStanceBadge = (stance: string) => {
    switch (stance) {
      case "WAR":
        return (
          <span className="px-2 py-0.5 rounded-md bg-military/20 text-military text-[9px] font-bold">
            در حال جنگ
          </span>
        );
      case "ALLIANCE":
        return (
          <span className="px-2 py-0.5 rounded-md bg-gdp/20 text-gdp text-[9px] font-bold">
            اتحاد کامل
          </span>
        );
      case "NON_AGGRESSION_PACT":
        return (
          <span className="px-2 py-0.5 rounded-md bg-treasury/20 text-treasury text-[9px] font-bold">
            عدم تخاصم
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-[9px] font-bold">
            صلح و دیپلماسی عادی
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

      <div className="bg-background/40 border border-border/80 p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div>
            <h2 className="text-sm font-extrabold text-foreground">
              {relation.name}
            </h2>
            <span className="text-[10px] text-muted-foreground font-mono">
              شناسنامه رسمی حاکمیت
            </span>
          </div>
          <div className="flex items-center gap-2">
            {getStanceBadge(relation.stance)}
            <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
              {relation.code}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-foreground/90 bg-secondary/30 p-3 rounded-xl leading-relaxed">
          {relation.description}
        </p>

        <CountryProfileStats data={relation.profileData} />

        <button
          onClick={() =>
            alert(`دوربین نقشه روی مرکز استراتژیک ${relation.name} متمرکز شد.`)
          }
          className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2 cursor-pointer"
        >
          <MapPin size={14} className="text-military" />
          <span>تمرکز دوربین روی نقشه</span>
        </button>
      </div>

      <DiplomacyActionButtons targetName={relation.name} />
    </div>
  );
}
