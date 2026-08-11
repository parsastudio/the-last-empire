import React, { useMemo } from "react";
import { NationHeaderCard } from "@/presentation/components/tactical-map/sidebar/nation-header-card";
import { EconomyStatsSection } from "@/presentation/components/tactical-map/sidebar/economy-stats-section";
import { ResourcesSection } from "@/presentation/components/tactical-map/sidebar/resources-section";
import { GovernmentStatusSection } from "@/presentation/components/tactical-map/sidebar/government-status-section";
import { RegionBreakdownCard } from "@/presentation/components/tactical-map/sidebar/region-breakdown-card";
import { Nation } from "@/domain/nation/nation.schema";
import {
  findCountryProfileById,
  CountryRegistry,
} from "@/domain/data/countries";
import { ResourceGenerationStep } from "@/engine/pipeline/economy/resource-generation.step";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";

interface WideOverviewViewProps {
  nation: Nation;
  rank?: number;
}

export function WideOverviewView({ nation, rank = 1 }: WideOverviewViewProps) {
  const { effectiveGdp, oilProducedPerTurn, oilRequiredPerTurn } =
    useMemo(() => {
      const numericId = CountryRegistry.resolveCanonicalId(nation.id);
      const profile = findCountryProfileById(numericId);

      const gdpVal = nation.gdp > 0 ? nation.gdp : (profile?.gdp ?? 5000000000);

      const { oilProducedPerTurn: produced } =
        ResourceGenerationStep.calculateResourceGeneration(nation);

      const required = PopulationWelfareCalculator.calculateOilDemand(
        nation.population,
        gdpVal,
        nation.doctrines?.unlockedDoctrines,
        nation.industrialLevel,
      );

      return {
        effectiveGdp: gdpVal,
        oilProducedPerTurn: produced,
        oilRequiredPerTurn: required,
      };
    }, [nation]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
        <NationHeaderCard
          name={nation.name}
          code={nation.id}
          flagCode={nation.flagCode}
          governmentType={nation.government.type}
          population={nation.population}
          territoryPixelCount={nation.geography.territoryPixelCount}
          rank={rank}
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
          industrialLevel={nation.industrialLevel}
          infrastructureLevel={nation.geography.infrastructureLevel}
          oilRequiredPerTurn={oilRequiredPerTurn}
          oilProducedPerTurn={oilProducedPerTurn}
        />
      </div>

      <div className="space-y-5">
        <GovernmentStatusSection
          stability={nation.government.stability}
          reputation={nation.globalReputation}
          nation={nation}
        />

        <RegionBreakdownCard
          regions={nation.regionsDemographics}
          nationName={nation.name}
          totalPixels={nation.geography.territoryPixelCount}
          totalPopulation={nation.population}
          totalGdp={effectiveGdp}
        />
      </div>
    </div>
  );
}
