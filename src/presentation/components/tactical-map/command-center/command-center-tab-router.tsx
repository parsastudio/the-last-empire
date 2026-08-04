import React from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { WideOverviewView } from "@/presentation/components/tactical-map/command-center/views/wide-overview-view";
import { WideMarketView } from "@/presentation/components/tactical-map/command-center/views/wide-market-view";
import { WideMilitaryView } from "@/presentation/components/tactical-map/command-center/views/wide-military-view";
import { WidePoliticsView } from "@/presentation/components/tactical-map/command-center/views/wide-politics-view";
import { WideProxyView } from "@/presentation/components/tactical-map/command-center/views/wide-proxy-view";
import { WideDiplomacyView } from "@/presentation/components/tactical-map/command-center/views/wide-diplomacy-view";
import { WideResearchView } from "@/presentation/components/tactical-map/command-center/views/wide-research-view";
import { WideAbilitiesView } from "@/presentation/components/tactical-map/command-center/views/wide-abilities-view";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";

interface CommandCenterTabRouterProps {
  activeTab: SidebarTabType;
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
  selectedTargetCode,
  nation,
  gameState,
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
          nation={nation}
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
          militaryTechLevel={nation.military.techLevel}
          hasSeaAccess={nation.geography.hasSeaAccess}
          activeModifiers={nation.activeModifiers}
          nationsMap={gameState?.nations}
          population={nation.population}
          oilStock={nation.resources.oil}
          steelStock={nation.resources.steel}
          globalReputation={nation.globalReputation}
        />
      );
    case "proxy":
      return (
        <WideProxyView
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
    case "abilities":
      return (
        <WideAbilitiesView
          currentGovernment={nation.government.type}
          nationId={nation.id}
        />
      );
    case "reports":
      return (
        <div className="py-20 text-center text-xs text-muted-foreground italic">
          بایگانی گزارش‌ها غیرفعال است.
        </div>
      );
    default:
      return null;
  }
}
