import React from "react";
import { Search } from "lucide-react";
import { NationDetail, NationListItem } from "./nation-list-item";

interface NationListSidebarProps {
  nations: NationDetail[];
  selectedId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectNation: (nation: NationDetail) => void;
}

export function NationListSidebar({
  nations,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelectNation,
}: NationListSidebarProps) {
  const filtered = nations.filter(
    (n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="lg:col-span-4 flex flex-col bg-card border border-border rounded-3xl overflow-hidden shadow-sm h-full">
      <div className="p-4 border-b border-border space-y-3 shrink-0">
        <h2 className="text-sm font-bold text-foreground">
          فهرست قدرت‌های جهانی
        </h2>
        <div className="relative">
          <Search
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="جستجوی کشور..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-right"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-border">
        {filtered.map((nation) => (
          <NationListItem
            key={nation.id}
            nation={nation}
            isSelected={selectedId === nation.id}
            onSelect={onSelectNation}
          />
        ))}
      </div>
    </div>
  );
}
