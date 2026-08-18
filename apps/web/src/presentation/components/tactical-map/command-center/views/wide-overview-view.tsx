import React, { useMemo } from "react";
import { NationHeaderCard } from "@/presentation/components/tactical-map/sidebar/nation-header-card";
import { EconomyStatsSection } from "@/presentation/components/tactical-map/sidebar/economy-stats-section";
import { ResourcesSection } from "@/presentation/components/tactical-map/sidebar/resources-section";
import { GovernmentStatusSection } from "@/presentation/components/tactical-map/sidebar/government-status-section";
import { VictoryProgressCard } from "@/presentation/components/tactical-map/command-center/views/components/victory-progress-card";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

interface WideOverviewViewProps {
  nation: Nation;
  rank?: number;
  gameState?: GameState | null;
}

export function WideOverviewView({
  nation,
  rank = 1,
  gameState,
}: WideOverviewViewProps) {
  const effectiveGdp = useMemo(() => {
    return getNationGdp(nation);
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
          population={nation.population}
          maxPopulationCapacity={nation.maxPopulationCapacity}
          perCapitaProductivity={nation.perCapitaProductivity}
          industrialLevel={nation.industrialLevel}
          infrastructureLevel={nation.geography.infrastructureLevel}
        />
      </div>
    </div>
  );
}
