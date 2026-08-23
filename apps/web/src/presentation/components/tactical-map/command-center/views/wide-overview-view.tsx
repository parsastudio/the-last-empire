import React, { useMemo } from "react";
import { NationHeaderCard } from "@/presentation/components/tactical-map/sidebar/nation-header-card";
import { EconomyStatsSection } from "@/presentation/components/tactical-map/sidebar/economy-stats-section";
import { ResourcesSection } from "@/presentation/components/tactical-map/sidebar/resources-section";
import { GovernmentStatusSection } from "@/presentation/components/tactical-map/sidebar/government-status-section";
import { VictoryProgressCard } from "@/presentation/components/tactical-map/command-center/views/components/victory-progress-card";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";

interface WideOverviewViewProps {
  nation: Nation;
  gameState?: GameState | null;
}

export function WideOverviewView({ nation, gameState }: WideOverviewViewProps) {
  const provincesMap = gameState?.provinces;

  const rank = useMemo(() => {
    return NationGettersUtility.getRank(
      nation.id,
      gameState?.nations,
      provincesMap,
    );
  }, [nation.id, gameState?.nations, provincesMap]);

  const effectiveGdp = useMemo(() => {
    return getNationGdp(nation, provincesMap);
  }, [nation, provincesMap]);

  const population = useMemo(() => {
    return NationGettersUtility.getPopulation(nation.id, provincesMap);
  }, [nation.id, provincesMap]);

  const maxCapacity = useMemo(() => {
    return NationGettersUtility.getMaxPopulationCapacity(
      nation.id,
      provincesMap,
    );
  }, [nation.id, provincesMap]);

  const productivity = useMemo(() => {
    return NationGettersUtility.getPerCapitaProductivity(
      nation.id,
      provincesMap,
    );
  }, [nation.id, provincesMap]);

  const territoryPixels = useMemo(() => {
    return NationGettersUtility.getTerritoryPixelCount(nation.id, provincesMap);
  }, [nation.id, provincesMap]);

  const infraLevel = useMemo(() => {
    return NationGettersUtility.getInfrastructureLevel(nation.id, provincesMap);
  }, [nation.id, provincesMap]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
        <NationHeaderCard
          name={nation.name}
          code={nation.id}
          flagCode={nation.flagCode}
          governmentType={nation.government.type}
          population={population}
          territoryPixelCount={territoryPixels}
          rank={rank}
        />

        <VictoryProgressCard nationId={nation.id} gameState={gameState} />

        <EconomyStatsSection
          gdp={effectiveGdp}
          treasury={nation.treasury}
          taxRate={nation.taxRate}
          nationalDebt={nation.nationalDebt}
          tariffRate={nation.tariffRate}
        />
      </div>

      <div className="space-y-5">
        <GovernmentStatusSection
          stability={nation.government.stability}
          reputation={nation.globalReputation}
          nation={nation}
        />

        <ResourcesSection
          population={population}
          maxPopulationCapacity={maxCapacity}
          perCapitaProductivity={productivity}
          industrialLevel={nation.industrialLevel}
          infrastructureLevel={infraLevel}
        />
      </div>
    </div>
  );
}
