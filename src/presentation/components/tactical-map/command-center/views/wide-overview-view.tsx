import React from "react";
import { NationHeaderCard } from "../../sidebar/nation-header-card";
import { EconomyStatsSection } from "../../sidebar/economy-stats-section";
import { ResourcesSection } from "../../sidebar/resources-section";
import { GovernmentStatusSection } from "../../sidebar/government-status-section";
import { RegionBreakdownCard } from "../../sidebar/region-breakdown-card";
import { Nation } from "@/domain/nation/nation.schema";
import { findCountryProfileById } from "@/domain/data/countries";

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

  const gdpScale = Math.max(1, Math.floor(effectiveGdp / 10000000000));
  const industrialMultiplier = 1.0 + ((nation.industrialLevel || 1) - 1) * 0.25;
  const isOilRich = nation.traits.includes("OIL_RICH");

  const baseOilLots = isOilRich
    ? Math.max(3, gdpScale * 2)
    : Math.max(1, Math.floor(gdpScale * 0.5));
  const baseSteelLots = Math.max(1, Math.floor(gdpScale * 0.8));

  const oilProducedPerTurn = Math.max(
    1,
    Math.ceil(baseOilLots * industrialMultiplier),
  );
  const steelProducedPerTurn = Math.max(
    1,
    Math.ceil(baseSteelLots * industrialMultiplier),
  );

  const gdpFactor = Math.max(1, Math.floor(effectiveGdp / 10000000000));
  const oilRequiredPerTurn = Math.max(
    1,
    Math.ceil((nation.population / 20000000) * gdpFactor),
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

        <RegionBreakdownCard regions={nation.regionsDemographics} />
      </div>
    </div>
  );
}
