import React from "react";
import { NationHeaderCard } from "@/presentation/components/tactical-map/sidebar/nation-header-card";
import { EconomyStatsSection } from "@/presentation/components/tactical-map/sidebar/economy-stats-section";
import { ResourcesSection } from "@/presentation/components/tactical-map/sidebar/resources-section";
import { GovernmentStatusSection } from "@/presentation/components/tactical-map/sidebar/government-status-section";
import { RegionBreakdownCard } from "@/presentation/components/tactical-map/sidebar/region-breakdown-card";
import { Nation } from "@/domain/nation/nation.schema";
import { findCountryProfileById } from "@/domain/data/countries";
import { ResourceGenerationStep } from "@/engine/pipeline/economy/resource-generation.step";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";

interface WideOverviewViewProps {
  nation: Nation;
  rank?: number;
}

export function WideOverviewView({ nation, rank = 1 }: WideOverviewViewProps) {
  const numericId = parseInt(nation.id.replace("NATION_", ""), 10);
  const profile = findCountryProfileById(numericId);

  const effectiveGdp =
    nation.gdp && nation.gdp > 0
      ? nation.gdp
      : profile
        ? profile.gdp
        : 5000000000;

  const { oilProducedPerTurn, steelProducedPerTurn } =
    ResourceGenerationStep.calculateResourceGeneration(nation);

  const welfareCalc = new PopulationWelfareCalculator();
  const oilRequiredPerTurn = welfareCalc.calculateOilDemand(
    nation.population,
    effectiveGdp,
    nation.doctrines?.unlockedDoctrines,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
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

        <EconomyStatsSection
          gdp={effectiveGdp}
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
          infrastructureLevel={nation.geography.infrastructureLevel}
          oilRequiredPerTurn={oilRequiredPerTurn}
          oilProducedPerTurn={oilProducedPerTurn}
          steelProducedPerTurn={steelProducedPerTurn}
        />
      </div>

      <div className="space-y-5">
        <GovernmentStatusSection
          stability={nation.government.stability}
          corruption={nation.government.corruption}
          reputation={nation.globalReputation}
          nation={nation}
        />

        <RegionBreakdownCard
          regions={nation.regionsDemographics}
          nationName={nation.name}
          totalArea={nation.geography.territorySize}
          totalPopulation={nation.population}
          totalGdp={effectiveGdp}
        />
      </div>
    </div>
  );
}
