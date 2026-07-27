import React from "react";
import { Users, Search, Swords, CheckCircle2, Handshake } from "lucide-react";
import { DiplomaticRelation } from "./diplomacy-detail-view";

interface DiplomacyListViewProps {
  relations: DiplomaticRelation[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectRelation: (relation: DiplomaticRelation) => void;
}

export function DiplomacyListView({
  relations,
  searchQuery,
  onSearchChange,
  onSelectRelation,
}: DiplomacyListViewProps) {
  const filtered = relations.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <Users size={13} className="text-diplomacy" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            مدیریت روابط و تعاملات دیپلماتیک
          </span>
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="جستجوی نام یا نماد کشور..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-right"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((rel) => (
          <button
            key={rel.code}
            onClick={() => onSelectRelation(rel)}
            className="w-full bg-background/40 hover:bg-secondary/50 border border-border/60 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-right transition-all cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {rel.name}
                </span>
                <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                  {rel.code}
                </span>
              </div>
              <div>{getStanceBadge(rel.stance)}</div>
            </div>
            <div className="text-left font-mono text-[10px] text-muted-foreground">
              <span>نظر: {rel.opinion}°</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
