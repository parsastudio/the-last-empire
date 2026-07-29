import React, { useMemo } from "react";
import { SidebarTabType } from "../sidebar/sidebar-tabs";
import { WideOverviewView } from "./views/wide-overview-view";
import { WideMarketView } from "./views/wide-market-view";
import { WideMilitaryView } from "./views/wide-military-view";
import { WidePoliticsView } from "./views/wide-politics-view";
import { WideDiplomacyView } from "./views/wide-diplomacy-view";
import { WideResearchView } from "./views/wide-research-view";
import { WideAbilitiesView } from "./views/wide-abilities-view";
import { WideReportsView } from "./views/wide-reports-view";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { PowerScoreRanker } from "@/engine/diplomacy/power-score-ranker";

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
}

export function CommandCenterTabRouter({
  activeTab,
  selectedTargetCode,
  nation,
  gameState,
  reports,
  onFocusCountry,
  onOpenTrade,
}: CommandCenterTabRouterProps) {
  const ranker = useMemo(() => new PowerScoreRanker(), []);

  const realRank = useMemo(() => {
    if (!gameState || !gameState.nations) return 1;
    const nationsList = Object.values(gameState.nations)
      .filter((n) => n.isAlive)
      .map((n) => ({
        id: n.id,
        gdp: n.gdp,
        treasury: n.treasury,
        infantry: n.military.infantry,
        airForce: n.military.airForce,
        drone: n.military.droneMissile,
        techLevel: n.military.techLevel,
      }));

    const ranked = ranker.rankNations(nationsList);
    const found = ranked.find((r) => r.id === nation.id);
    return found ? found.rank : 1;
  }, [gameState, nation.id, ranker]);

  switch (activeTab) {
    case "overview":
      return <WideOverviewView nation={nation} rank={realRank} />;
    case "market":
      return (
        <WideMarketView
          marketPrices={gameState?.marketPrices}
          oilStock={nation.resources.oil}
          steelStock={nation.resources.steel}
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
        />
      );
    case "politics":
      return (
        <WidePoliticsView
          nationId={nation.id}
          gdp={nation.gdp}
          taxRate={nation.taxRate}
          governmentType={nation.government.type}
          nationalDebt={nation.nationalDebt}
          tariffRate={nation.tariffRate}
          industrialLevel={nation.industrialLevel}
          infrastructureLevel={nation.geography.infrastructureLevel}
          activeModifiers={nation.activeModifiers}
        />
      );
    case "diplomacy":
      return (
        <WideDiplomacyView
          selectedTargetCode={selectedTargetCode}
          nationsMap={gameState?.nations}
          onFocusCountry={onFocusCountry}
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
