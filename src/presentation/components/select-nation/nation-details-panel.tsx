import React from "react";
import { Zap } from "lucide-react";
import { NationDetail } from "./nation-list-item";
import { NationOverviewStats } from "./nation-overview-stats";
import {
  GovernmentTypeSelector,
  GovernmentOption,
} from "./government-type-selector";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface NationDetailsPanelProps {
  nation: NationDetail;
  governmentOptions: GovernmentOption[];
  selectedGovernment: string;
  onSelectGovernment: (type: string) => void;
  onStartCampaign: () => void;
}

export function NationDetailsPanel({
  nation,
  governmentOptions,
  selectedGovernment,
  onSelectGovernment,
  onStartCampaign,
}: NationDetailsPanelProps) {
  const flagEmoji = getFlagEmoji(nation.code);

  return (
    <div className="lg:col-span-8 flex flex-col bg-card border border-border rounded-3xl p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent shadow-sm h-full space-y-6 dir-rtl text-right">
      <div className="flex items-center gap-4 pb-5 border-b border-border">
        <span
          className="text-4xl select-none shrink-0"
          role="img"
          aria-label={nation.name}
        >
          {flagEmoji}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-foreground">
              {nation.name}
            </h1>
            <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
              {nation.id}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{nation.power}</p>
        </div>
      </div>

      <NationOverviewStats nation={nation} />

      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
          شرح راهبردی کشور
        </span>
        <p className="text-xs text-foreground/90 leading-relaxed bg-background/40 border border-border p-4 rounded-2xl">
          {nation.desc}
        </p>
      </div>

      <GovernmentTypeSelector
        options={governmentOptions}
        selectedType={selectedGovernment}
        onSelect={onSelectGovernment}
      />

      <div className="pt-4 border-t border-border">
        <button
          onClick={onStartCampaign}
          className="w-full py-4 px-8 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-bold transition-all shadow-lg shadow-gdp/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap size={16} fill="currentColor" />
          <span>شروع امپراتوری {nation.name}</span>
        </button>
      </div>
    </div>
  );
}
