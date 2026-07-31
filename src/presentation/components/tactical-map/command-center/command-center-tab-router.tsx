import React from "react";
import { SidebarTabType } from "../sidebar/sidebar-tabs";
import { WideOverviewView } from "./views/wide-overview-view";
import { WideMarketView } from "./views/wide-market-view";
import { WideMilitaryView } from "./views/wide-military-view";
import { WidePoliticsView } from "./views/wide-politics-view";
import { WideProxyView } from "./views/wide-proxy-view";
import { WideDiplomacyView } from "./views/wide-diplomacy-view";
import { WideResearchView } from "./views/wide-research-view";
import { WideAbilitiesView } from "./views/wide-abilities-view";
import { WideReportsView } from "./views/wide-reports-view";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";

interface CommandCenterTabRouterProps {
  activeTab: SidebarTabType;
  activeSubTab?: string | null;
  selectedTargetCode?: string | null;
  nation: Nation;
  gameState?: GameState | null;
  reports: CombatReport[];
  onFocusCountry?: (code: string) => void;
  onOpenTrade: (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => void;
  onNavigateTab?: (tab: SidebarTabType, targetCode?: string) => void;
}

export function CommandCenterTabRouter({
  activeTab,
  activeSubTab,
  selectedTargetCode,
  nation,
  gameState,
  reports,
  onFocusCountry,
  onOpenTrade,
  onNavigateTab,
}: CommandCenterTabRouterProps) {
  switch (activeTab) {
    case "overview":
      return <WideOverviewView nation={nation} rank={nation.rank} />;
    case "market":
      return (
        <WideMarketView
          marketPrices={gameState?.marketPrices}
          oilStock={nation.resources.oil}
          steelStock={nation.resources.steel}
          userTreasury={nation.treasury}
          onOpenTrade={onOpenTrade}
        />
      );
    case "military":
      return (
        <WideMilitaryView
          military={nation.military}
          population={nation.population}
          stability={nation.government.stability}
          recruitmentQueue={nation.recruitmentQueue}
          nationId={nation.id}
          treasury={nation.treasury}
          manpower={nation.resources.manpower}
          steel={nation.resources.steel}
        />
      );
    case "politics":
      return (
        <WidePoliticsView
          nationId={nation.id}
          gdp={nation.gdp}
          treasury={nation.treasury}
          turnsInPower={nation.government.turnsInPower}
          taxRate={nation.taxRate}
          corruption={nation.government.corruption}
          governmentType={nation.government.type}
          nationalDebt={nation.nationalDebt}
          tariffRate={nation.tariffRate}
          industrialLevel={nation.industrialLevel}
          infrastructureLevel={nation.geography.infrastructureLevel}
          hasSeaAccess={nation.geography.hasSeaAccess}
          activeModifiers={nation.activeModifiers}
          nationsMap={gameState?.nations}
        />
      );
    case "proxy":
      return (
        <WideProxyView
          nation={nation}
          nationsMap={gameState?.nations}
          selectedTargetCode={selectedTargetCode}
          activeSubTab={activeSubTab}
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
      return (
        <WideResearchView
          nationId={nation.id}
          unlockedDoctrines={nation.doctrines.unlockedDoctrines}
          doctrinePoints={nation.doctrines.doctrinePoints}
        />
      );
    case "abilities":
      return (
        <WideAbilitiesView
          currentGovernment={nation.government.type}
          nationId={nation.id}
        />
      );
    case "reports":
      return <WideReportsView reports={reports} />;
    default:
      return null;
  }
}
