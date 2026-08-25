import React from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { WideOverviewView } from "@/presentation/components/tactical-map/command-center/views/wide-overview-view";
import { WideMilitaryView } from "@/presentation/components/tactical-map/command-center/views/wide-military-view";
import { WideArmsMarketView } from "@/presentation/components/tactical-map/command-center/views/wide-arms-market-view";
import { WidePoliticsView } from "@/presentation/components/tactical-map/command-center/views/wide-politics-view";
import { WideEspionageView } from "@/presentation/components/tactical-map/command-center/views/wide-espionage-view";
import { WideDiplomacyView } from "@/presentation/components/tactical-map/command-center/views/wide-diplomacy-view";
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
      return <WideOverviewView nation={nation} gameState={gameState} />;
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
          provincesMap={gameState?.provinces}
          selectedTargetCode={selectedTargetCode}
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
    case "espionage":
      return (
        <WideEspionageView
          nation={nation}
          nationsMap={gameState?.nations}
          provincesMap={gameState?.provinces}
          selectedTargetCode={selectedTargetCode}
        />
      );
    case "diplomacy":
      return (
        <WideDiplomacyView
          selectedTargetCode={selectedTargetCode}
          nationsMap={gameState?.nations}
          humanNationId={nation.id}
          provincesMap={gameState?.provinces}
          onFocusCountry={onFocusCountry}
          onNavigateTab={onNavigateTab}
        />
      );
    case "reports":
      return (
        <WideReportsView
          logs={gameState?.turnLogs}
          currentTurn={gameState?.currentTurn ?? 1}
          humanNationId={nation.id}
          nationsMap={gameState?.nations}
          pendingProposals={gameState?.pendingProposals}
        />
      );
    default:
      return null;
  }
}
