import React from "react";
import { Zap } from "lucide-react";
import { NationDetail } from "./nation-list-item";
import { NationOverviewStats } from "./nation-overview-stats";
import {
  GovernmentTypeSelector,
  GovernmentOption,
} from "./government-type-selector";

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
  return (
    <div className="lg:col-span-8 flex flex-col bg-card border border-border rounded-3xl p-6 overflow-y-auto shadow-sm h-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/flags/${nation.code.toLowerCase()}.png`}
            alt={nation.name}
            className="w-14 h-10 object-cover rounded-xl shadow-md border border-border"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-foreground">
                {nation.name}
              </h1>
              <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                {nation.id}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {nation.power}
            </p>
          </div>
        </div>

        <button
          onClick={onStartCampaign}
          className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-950/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap size={15} fill="currentColor" />
          <span>آغاز حکومت و ورود به نقشه</span>
        </button>
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
    </div>
  );
}
