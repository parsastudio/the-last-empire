import React from "react";
import { NationHeaderCard } from "../../sidebar/nation-header-card";
import { EconomyStatsSection } from "../../sidebar/economy-stats-section";
import { ResourcesSection } from "../../sidebar/resources-section";
import { GovernmentStatusSection } from "../../sidebar/government-status-section";
import { RegionBreakdownCard } from "../../sidebar/region-breakdown-card";

interface WideOverviewViewProps {
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
    regionsDemographics?: Array<{
      regionId: number;
      name: string;
      pixelCount: number;
      areaSqKm: number;
      population: number;
      gdp: number;
    }>;
  };
}

export function WideOverviewView({ nation }: WideOverviewViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
      <div className="space-y-5">
        <NationHeaderCard
          name={nation.name}
          code={nation.code}
          flagCode={nation.flagCode}
          governmentType={nation.government.type}
          population={nation.population}
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
