import React, { useState } from "react";
import {
  ArrowRight,
  Swords,
  CheckCircle2,
  Handshake,
  Eye,
  MapPin,
} from "lucide-react";
import { DiplomacyActionButtons } from "./diplomacy-action-buttons";
import { DiplomacyIntelView } from "./diplomacy-intel-view";

export interface DiplomaticRelation {
  code: string;
  name: string;
  stance: "PEACE" | "WAR" | "ALLIANCE" | "NON_AGGRESSION_PACT";
  opinion: number;
  description: string;
  intelData: {
    gdp: string;
    population: string;
    militaryStrength: string;
    techLevel: number;
    stabilityDesc: string;
  };
}

interface DiplomacyDetailViewProps {
  relation: DiplomaticRelation;
  onBack: () => void;
}

export function DiplomacyDetailView({
  relation,
  onBack,
}: DiplomacyDetailViewProps) {
  const [showIntel, setShowIntel] = useState(false);

  const getStanceBadge = (stance: string) => {
    switch (stance) {
      case "WAR":
        return (
          <span className="px-2 py-0.5 rounded-md bg-military/20 text-military text-[9px] font-bold flex items-center gap-1">
            <Swords size={10} /> در حال جنگ
          </span>
        );
      case "ALLIANCE":
        return (
          <span className="px-2 py-0.5 rounded-md bg-gdp/20 text-gdp text-[9px] font-bold flex items-center gap-1">
            <CheckCircle2 size={10} /> اتحاد کامل
          </span>
        );
      case "NON_AGGRESSION_PACT":
        return (
          <span className="px-2 py-0.5 rounded-md bg-treasury/20 text-treasury text-[9px] font-bold flex items-center gap-1">
            <Handshake size={10} /> عدم تخاصم
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-[9px] font-bold">
            صلح و آرام
          </span>
        );
    }
  };

  if (showIntel) {
    return (
      <DiplomacyIntelView
        relation={relation}
        onBack={() => setShowIntel(false)}
      />
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowRight size={14} />
        <span>بازگشت به فهرست کشورها</span>
      </button>

      <div className="bg-background/40 border border-border/80 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-foreground">
            {relation.name}
          </span>
          <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
            {relation.code}
          </span>
        </div>

        <div className="text-xs space-y-1">
          <p className="text-muted-foreground">وضعیت دیپلماتیک فعلی:</p>
          <div>{getStanceBadge(relation.stance)}</div>
        </div>

        <p className="text-[11px] text-foreground/90 bg-secondary/40 p-3 rounded-xl">
          {relation.description}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() =>
              alert(
                `دوربین نقشه روی مختصات استراتژیک کشور ${relation.name} متمرکز شد.`,
              )
            }
            className="py-2 px-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-[10px] font-bold transition-all border border-border flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MapPin size={13} className="text-military" />
            <span>نمایش روی نقشه</span>
          </button>

          <button
            onClick={() => setShowIntel(true)}
            className="py-2 px-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-[10px] font-bold transition-all border border-border flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye size={13} className="text-gdp" />
            <span>اطلاعات کلی (جاسوسی)</span>
          </button>
        </div>
      </div>

      <DiplomacyActionButtons targetName={relation.name} />
    </div>
  );
}
