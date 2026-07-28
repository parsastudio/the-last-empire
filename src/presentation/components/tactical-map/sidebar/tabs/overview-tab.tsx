import React from "react";
import { NationHeaderCard } from "../nation-header-card";
import { EconomyStatsSection } from "../economy-stats-section";
import { ResourcesSection } from "../resources-section";
import { GovernmentStatusSection } from "../government-status-section";
import { RegionBreakdownCard } from "../region-breakdown-card";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";

interface OverviewTabProps {
  nation: {
    name: string;
    code: string;
    flagCode: string;
    gdp: number;
    taxRate: number;
    tariffRate: number;
    treasury: number;
    nationalDebt: number;
    population: number;
    warExhaustion: number;
    industrialLevel: number;
    government: {
      type: string;
      stability: number;
      corruption: number;
      socialFreedom: number;
    };
    resources: {
      oil: number;
      steel: number;
      manpower: number;
    };
    globalReputation: number;
    globalAggression: number;
    regionsDemographics?: RegionDemographics[];
  };
}

export function OverviewTab({ nation }: OverviewTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <NationHeaderCard
        name={nation.name}
        code={nation.code}
        flagCode={nation.flagCode}
        governmentType={nation.government.type}
        population={nation.population}
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
