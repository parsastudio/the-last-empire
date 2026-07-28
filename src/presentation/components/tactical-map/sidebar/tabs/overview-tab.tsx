import React from "react";
import { NationHeaderCard } from "../nation-header-card";
import { EconomyStatsSection } from "../economy-stats-section";
import { ResourcesSection } from "../resources-section";
import { GovernmentStatusSection } from "../government-status-section";
import { RegionBreakdownCard } from "../region-breakdown-card";
import { Nation } from "@/domain/nation/nation.schema";

interface OverviewTabProps {
  nation: Nation;
  rank?: number;
}

export function OverviewTab({ nation, rank = 1 }: OverviewTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
      <NationHeaderCard
        name={nation.name}
        code={nation.id}
        flagCode={nation.flagCode}
        governmentType={nation.government.type}
        population={nation.population}
        territorySize={nation.geography.territorySize}
        rank={rank}
        regions={nation.regionsDemographics}
      />

      <RegionBreakdownCard regions={nation.regionsDemographics} />

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

      <GovernmentStatusSection
        stability={nation.government.stability}
        corruption={nation.government.corruption}
        warExhaustion={nation.warExhaustion}
        reputation={nation.globalReputation}
        globalAggression={nation.globalAggression}
        socialFreedom={nation.government.socialFreedom}
      />
    </div>
  );
}
