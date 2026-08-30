import React, { useMemo } from "react";
import { NationHeaderCard } from "@/presentation/components/tactical-map/sidebar/nation-header-card";
import { EconomyStatsSection } from "@/presentation/components/tactical-map/sidebar/economy-stats-section";
import { ResourcesSection } from "@/presentation/components/tactical-map/sidebar/resources-section";
import { GovernmentStatusSection } from "@/presentation/components/tactical-map/sidebar/government-status-section";
import { VictoryProgressCard } from "@/presentation/components/tactical-map/command-center/views/components/victory-progress-card";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { selectNationOverviewViewModel } from "@/presentation/selectors/nation-overview-model.selector";

interface WideOverviewViewProps {
  nation: Nation;
  gameState?: GameState | null;
}

export function WideOverviewView({ nation, gameState }: WideOverviewViewProps) {
  const model = useMemo(
    () =>
      selectNationOverviewViewModel(
        nation,
        gameState?.nations,
        gameState?.provinces,
      ),
    [nation, gameState?.nations, gameState?.provinces],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
        <NationHeaderCard
          name={model.name}
          code={model.id}
          flagCode={model.flagCode}
          governmentType={model.governmentType}
          population={model.population}
          territoryPixelCount={model.territoryPixelCount}
          rank={model.rank}
        />

        <VictoryProgressCard nationId={model.id} gameState={gameState} />

        <EconomyStatsSection
          gdp={model.gdp}
          treasury={model.treasury}
          nationalDebt={model.nationalDebt}
          economicStance={model.economicStance}
        />
      </div>

      <div className="space-y-5">
        <GovernmentStatusSection
          stability={model.stability}
          reputation={model.globalReputation}
          nation={nation}
        />

        <ResourcesSection
          totalActiveFactories={model.totalActiveFactories}
          totalMaxSlots={model.totalMaxSlots}
          industrialLevel={model.industrialLevel}
          equipmentTechLevel={model.equipmentTechLevel}
        />
      </div>
    </div>
  );
}
