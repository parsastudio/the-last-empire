import React from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { WideOverviewView } from "@/presentation/components/tactical-map/command-center/views/wide-overview-view";
import { WideMilitaryView } from "@/presentation/components/tactical-map/command-center/views/wide-military-view";
import { WideArmsMarketView } from "@/presentation/components/tactical-map/command-center/views/wide-arms-market-view";
import { WidePoliticsView } from "@/presentation/components/tactical-map/command-center/views/wide-politics-view";
import { WideEspionageView } from "@/presentation/components/tactical-map/command-center/views/wide-espionage-view";
import { WideDiplomacyView } from "@/presentation/components/tactical-map/command-center/views/wide-diplomacy-view";
import { WideResearchView } from "@/presentation/components/tactical-map/command-center/views/wide-research-view";
import { WideReportsView } from "@/presentation/components/tactical-map/command-center/views/wide-reports-view";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";

interface CommandCenterTabRouterProps {
  activeTab: SidebarTabType;
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
  selectedTargetCode,
  nation,
  gameState,
  onFocusCountry,
  onNavigateTab,
}: CommandCenterTabRouterProps) {
  switch (activeTab) {
    case "overview":
      return (
        <WideOverviewView
          nation={nation}
          rank={nation.rank}
          gameState={gameState}
        />
      );
    case "military":
      return (
        <WideMilitaryView
          military={nation.military}
          recruitmentQueue={nation.recruitmentQueue}
          nationId={nation.id}
          treasury={nation.treasury}
          industrialLevel={nation.industrialLevel}
        />
      );
    case "market":
      return (
        <WideArmsMarketView
          nation={nation}
          nationsMap={gameState?.nations}
          selectedTargetCode={selectedTargetCode}
        />
      );
    case "politics":
      return (
        <WidePoliticsView nation={nation} nationsMap={gameState?.nations} />
      );
    case "espionage":
      return (
        <WideEspionageView
          nation={nation}
          nationsMap={gameState?.nations}
          selectedTargetCode={selectedTargetCode}
        />
      );
    case "diplomacy":
      return (
        <WideDiplomacyView
          selectedTargetCode={selectedTargetCode}
          nationsMap={gameState?.nations}
          humanNationId={nation.id}
          onFocusCountry={onFocusCountry}
          onNavigateTab={onNavigateTab}
        />
      );
    case "research":
      return <WideResearchView nationId={nation.id} nation={nation} />;
    case "reports":
      return (
        <WideReportsView
          logs={gameState?.turnLogs}
          humanNationId={nation.id}
          nationsMap={gameState?.nations}
        />
      );
    default:
      return null;
  }
}
