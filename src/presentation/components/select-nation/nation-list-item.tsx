import React from "react";
import { ChevronLeft } from "lucide-react";

export interface NationDetail {
  id: string;
  name: string;
  code: string;
  rank: number;
  power: string;
  gdp: string;
  population: string;
  treasury: string;
  desc: string;
  defaultGovernment: string;
}

interface NationListItemProps {
  nation: NationDetail;
  isSelected: boolean;
  onSelect: (nation: NationDetail) => void;
}

export function NationListItem({
  nation,
  isSelected,
  onSelect,
}: NationListItemProps) {
  return (
    <button
      onClick={() => onSelect(nation)}
      className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between gap-3 text-right cursor-pointer border ${
        isSelected
          ? "bg-secondary border-primary/40 shadow-sm"
          : "bg-background/40 border-border/60 hover:bg-secondary/30"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/flags/${nation.code.toLowerCase()}.png`}
          alt={nation.name}
          className="w-7 h-5 object-cover rounded shadow-sm border border-border shrink-0"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
        <div>
          <span className="text-xs font-bold text-foreground block">
            {nation.name}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            رتبه جهانی: {nation.rank}
          </span>
        </div>
      </div>
      <ChevronLeft
        size={14}
        className={`text-muted-foreground transition-transform ${isSelected ? "-translate-x-1 text-primary" : ""}`}
      />
    </button>
  );
}
