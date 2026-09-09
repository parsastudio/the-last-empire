import React from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { WideOverviewView } from "@/presentation/components/tactical-map/command-center/views/wide-overview-view";
import { WideMilitaryView } from "@/presentation/components/tactical-map/command-center/views/wide-military-view";
import { WideIndustryView } from "@/presentation/components/tactical-map/command-center/views/wide-industry-view";
import { WideProjectsView } from "@/presentation/components/tactical-map/command-center/views/wide-projects-view";
import { WidePoliticsView } from "@/presentation/components/tactical-map/command-center/views/wide-politics-view";
import { WideDiplomacyView } from "@/presentation/components/tactical-map/command-center/views/wide-diplomacy-view";
import { WideEspionageView } from "@/presentation/components/tactical-map/command-center/views/wide-espionage-view";
import { WideReportsView } from "@/presentation/components/tactical-map/command-center/views/wide-reports-view";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";

interface CommandCenterTabRouterProps {
  activeTab: SidebarTabType;
  activeSubTab?: string | null;
  selectedTargetCode?: string | null;
  nation: Nation;
  gameState?: GameState | null;
  onFocusCountry?: (code: string) => void;
  onNavigateTab?: (
    tab: SidebarTabType,
    subTab?: string,
    targetCode?: string,
  ) => void;
}

export function CommandCenterTabRouter({
  activeTab,
  activeSubTab,
  selectedTargetCode,
  nation,
  gameState,
  onFocusCountry,
  onNavigateTab,
}: CommandCenterTabRouterProps) {
  const currentNationActivity = gameState?.turnActivity?.[nation.id];

  switch (activeTab) {
    case "overview":
      return <WideOverviewView nation={nation} gameState={gameState} />;

    case "military":
      return (
        <WideMilitaryView
          nation={nation}
          nationsMap={gameState?.nations}
          provincesMap={gameState?.provinces}
          selectedTargetCode={selectedTargetCode}
        />
      );

    case "industry":
      return (
        <WideIndustryView
          nation={nation}
          nationsMap={gameState?.nations}
          provincesMap={gameState?.provinces}
          initialSubTab={activeSubTab}
        />
      );

    case "projects":
      return (
        <WideProjectsView
          nation={nation}
          turnActivity={currentNationActivity}
        />
      );

    case "politics":
      return (
        <WidePoliticsView
          nation={nation}
          nationsMap={gameState?.nations}
          provincesMap={gameState?.provinces}
        />
      );

    case "diplomacy":
      return (
        <WideDiplomacyView
          selectedTargetCode={selectedTargetCode}
          nationsMap={gameState?.nations}
          humanNationId={gameState?.humanNationId || nation.id}
          provincesMap={gameState?.provinces}
          turnActivity={currentNationActivity}
          onFocusCountry={onFocusCountry}
          onNavigateTab={onNavigateTab}
        />
      );

    case "espionage":
      return (
        <WideEspionageView
          nation={nation}
          nationsMap={gameState?.nations}
          provincesMap={gameState?.provinces}
          selectedTargetCode={selectedTargetCode}
          turnActivity={currentNationActivity}
        />
      );

    case "reports":
      return (
        <WideReportsView
          logs={gameState?.turnLogs || []}
          currentTurn={gameState?.currentTurn || 1}
          humanNationId={gameState?.humanNationId || nation.id}
          nationsMap={gameState?.nations}
          pendingProposals={gameState?.pendingProposals || []}
          gameId={gameState?.gameId}
        />
      );

    default:
      return null;
  }
}
