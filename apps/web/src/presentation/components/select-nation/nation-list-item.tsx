import React from "react";
import { ChevronRight } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
  const { toDigits } = useLocaleFormatter();
  const flagEmoji = getFlagEmoji(nation.code);

  return (
    <button
      onClick={() => onSelect(nation)}
      className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between gap-3 text-start cursor-pointer border ${
        isSelected
          ? "bg-secondary border-primary/40 shadow-sm"
          : "bg-background/40 border-border/60 hover:bg-secondary/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-2xl select-none shrink-0"
          role="img"
          aria-label={nation.name}
        >
          {flagEmoji}
        </span>
        <div>
          <span className="text-xs font-bold text-foreground block">
            {nation.name}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            #{toDigits(nation.rank)}
          </span>
        </div>
      </div>
      <ChevronRight
        size={14}
        className={`text-muted-foreground rtl:rotate-180 transition-transform ${
          isSelected ? "translate-x-1 rtl:-translate-x-1 text-primary" : ""
        }`}
      />
    </button>
  );
}
