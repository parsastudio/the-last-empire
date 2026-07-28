import React from "react";
import { NationHeaderCard } from "../../sidebar/nation-header-card";
import { EconomyStatsSection } from "../../sidebar/economy-stats-section";
import { ResourcesSection } from "../../sidebar/resources-section";
import { GovernmentStatusSection } from "../../sidebar/government-status-section";
import { RegionBreakdownCard } from "../../sidebar/region-breakdown-card";
import { Nation } from "@/domain/nation/nation.schema";

interface WideOverviewViewProps {
  nation: Nation;
  rank?: number;
}

export function WideOverviewView({ nation, rank = 1 }: WideOverviewViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
        <NationHeaderCard
          name={nation.name}
          code={nation.id}
          flagCode={nation.flagCode}
          governmentType={nation.government.type}
          population={nation.population}
          rank={rank}
          regions={nation.regionsDemographics}
        />

        <EconomyStatsSection
          gdp={nation.gdp}
          treasury={nation.treasury}
          taxRate={nation.taxRate}
          nationalDebt={nation.nationalDebt}
          tariffRate={nation.tariffRate}
        />

        <ResourcesSection
          oil={nation.resources.oil}
          steel={nation.resources.steel}
          manpower={nation.resources.manpower}
          industrialLevel={nation.industrialLevel}
        />
      </div>

      <div className="space-y-5">
        <GovernmentStatusSection
          stability={nation.government.stability}
          corruption={nation.government.corruption}
          warExhaustion={nation.warExhaustion}
          reputation={nation.globalReputation}
          globalAggression={nation.globalAggression}
          socialFreedom={nation.government.socialFreedom}
        />

        <RegionBreakdownCard regions={nation.regionsDemographics} />
      </div>
    </div>
  );
}
