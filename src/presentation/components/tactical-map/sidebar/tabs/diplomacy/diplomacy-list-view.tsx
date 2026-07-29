import React from "react";
import { Users, Search } from "lucide-react";
import { DiplomaticRelation } from "./diplomacy-detail-view";
import { DiplomacyListItem } from "./diplomacy-list-item";

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
  const query = searchQuery.trim().toLowerCase();

  const filtered = relations.filter(
    (r) =>
      !query ||
      r.name.toLowerCase().includes(query) ||
      r.code.toLowerCase().includes(query) ||
      r.flagCode.toLowerCase().includes(query),
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right">
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
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground italic">
            هیچ کشوری با این مشخصات یافت نشد.
          </div>
        ) : (
          filtered.map((rel) => (
            <DiplomacyListItem
              key={rel.code}
              relation={rel}
              onSelect={onSelectRelation}
            />
          ))
        )}
      </div>
    </div>
  );
}
