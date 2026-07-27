import React from "react";
import { ArrowRight, Swords, CheckCircle2, Handshake } from "lucide-react";
import { DiplomacyActionButtons } from "./diplomacy-action-buttons";

export interface DiplomaticRelation {
  code: string;
  name: string;
  stance: "PEACE" | "WAR" | "ALLIANCE" | "NON_AGGRESSION_PACT";
  opinion: number;
  description: string;
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
      </div>

      <DiplomacyActionButtons targetName={relation.name} />
    </div>
  );
}
