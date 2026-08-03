import React from "react";
import { Zap, ShieldCheck } from "lucide-react";
import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { NationOverviewStats } from "@/presentation/components/select-nation/nation-overview-stats";
import {
  GovernmentTypeSelector,
  GovernmentOption,
} from "@/presentation/components/select-nation/government-type-selector";
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
    <div className="lg:col-span-8 flex flex-col bg-card/90 backdrop-blur-2xl border border-border/80 rounded-3xl p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent shadow-2xl h-full space-y-6 dir-rtl text-right transition-all">
      <div className="flex items-center justify-between pb-5 border-b border-border/80">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/60 border border-border/80 flex items-center justify-center text-4xl shadow-inner select-none shrink-0">
            {flagEmoji}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {nation.name}
              </h1>
              <span className="text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 rounded-lg">
                {nation.id}
              </span>
            </div>
            <p className="text-xs font-semibold text-gdp flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>{nation.power}</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-muted-foreground">
          <span>رتبه قدرت: #{nation.rank}</span>
        </div>
      </div>

      <NationOverviewStats nation={nation} />

      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
          شناسنامه استراتژیک
        </span>
        <div className="text-xs text-foreground/90 leading-relaxed bg-background/50 border border-border/60 p-4.5 rounded-2xl shadow-inner font-sans">
          {nation.desc}
        </div>
      </div>

      <GovernmentTypeSelector
        options={governmentOptions}
        selectedType={selectedGovernment}
        onSelect={onSelectGovernment}
      />

      <div className="pt-4 border-t border-border/80">
        <button
          onClick={onStartCampaign}
          className="w-full py-4 px-8 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-black transition-all shadow-lg shadow-gdp/20 hover:shadow-gdp/30 hover:scale-[1.005] active:scale-[0.995] text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer border border-gdp/30"
        >
          <Zap size={18} fill="currentColor" className="animate-pulse" />
          <span>تایید و شروع حاکمیت بر امپراتوری {nation.name}</span>
        </button>
      </div>
    </div>
  );
}
