import React from "react";
import { NationHeaderCard } from "../../sidebar/nation-header-card";
import { EconomyStatsSection } from "../../sidebar/economy-stats-section";
import { ResourcesSection } from "../../sidebar/resources-section";
import { GovernmentStatusSection } from "../../sidebar/government-status-section";
import { RegionBreakdownCard } from "../../sidebar/region-breakdown-card";
import { Nation } from "@/domain/nation/nation.schema";
import { findCountryProfileById } from "@/domain/map/countries";

interface WideOverviewViewProps {
  nation: Nation;
  rank?: number;
  activeSubTab?: string | null;
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

  const isOilRich = nation.traits.includes("OIL_RICH");
  const isIndustrialHub = nation.traits.includes("INDUSTRIAL_HUB");
  const territoryFactor = Math.floor(nation.geography.territorySize / 1000);

  const oilProducedPerTurn = isOilRich
    ? 300 + territoryFactor * 25
    : Math.max(10, territoryFactor * 5);

  const steelProducedPerTurn = isIndustrialHub
    ? 150 + territoryFactor * 15
    : Math.max(10, territoryFactor * 5);

  const oilRequiredPerTurn = Math.ceil(
    (nation.military.airForce + nation.military.droneMissile) * 0.5,
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
        />

        <RegionBreakdownCard regions={nation.regionsDemographics} />
      </div>
    </div>
  );
}
