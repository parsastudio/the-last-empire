import React, { useState } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";
import {
  Activity,
  DollarSign,
  Swords,
  Globe,
  TrendingUp,
  X,
} from "lucide-react";
import { SovereignStatsPanel } from "../panel/sovereign-stats-panel";
import { GlobalLeaderboardPanel } from "../panel/global-leaderboard-panel";
import { StateUpgradesPanel } from "../panel/state-upgrades-panel";
import { UnlockedDoctrinesPanel } from "../panel/unlocked-doctrines-panel";
import { MilitaryRecruitmentPanel } from "../panel/military-recruitment-panel";
import { MarketExchangePanel } from "../panel/market-exchange-panel";
import { DiplomaticRelationsPanel } from "../panel/diplomatic-relations-panel";

interface LeftCommandHubProps {
  gameState: GameState;
  humanNation: Nation;
  playerNationId: string;
  rankings: Array<{ id: string; score: number; rank: number }>;
  onTaxChange: (rate: number) => void;
  onUpgradeInfra: () => void;
  onUpgradeIndustrial: () => void;
  onUnlockDoctrine: (id: string) => void;
  onRecruit: (type: UnitType, qty: number) => void;
  onBuyResource: (type: "oil" | "steel", amt: number) => void;
  onPropose: (type: DiplomaticProposalType) => void;
  onDeclareWar: () => void;
}

type TabType = "STATS" | "ECONOMY" | "MILITARY" | "MARKET" | "DIPLOMACY" | null;

export function LeftCommandHub({
  gameState,
  humanNation,
  playerNationId,
  rankings,
  onTaxChange,
  onUpgradeInfra,
  onUpgradeIndustrial,
  onUnlockDoctrine,
  onRecruit,
  onBuyResource,
  onPropose,
  onDeclareWar,
}: LeftCommandHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>(null);

  const toggleTab = (tab: TabType) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className="absolute top-0 left-0 h-screen flex flex-row z-40 pointer-events-none">
      <div className="w-16 bg-slate-950/95 border-r border-slate-900 flex flex-col items-center py-6 gap-8 pointer-events-auto">
        <button
          onClick={() => toggleTab("STATS")}
          className={`p-2.5 rounded-2xl transition-all ${
            activeTab === "STATS"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "text-slate-500 hover:text-slate-200"
          }`}
        >
          <Activity size={20} />
        </button>
        <button
          onClick={() => toggleTab("ECONOMY")}
          className={`p-2.5 rounded-2xl transition-all ${
            activeTab === "ECONOMY"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "text-slate-500 hover:text-slate-200"
          }`}
        >
          <TrendingUp size={20} />
        </button>
        <button
          onClick={() => toggleTab("MILITARY")}
          className={`p-2.5 rounded-2xl transition-all ${
            activeTab === "MILITARY"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "text-slate-500 hover:text-slate-200"
          }`}
        >
          <Swords size={20} />
        </button>
        <button
          onClick={() => toggleTab("MARKET")}
          className={`p-2.5 rounded-2xl transition-all ${
            activeTab === "MARKET"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "text-slate-500 hover:text-slate-200"
          }`}
        >
          <DollarSign size={20} />
        </button>
        <button
          onClick={() => toggleTab("DIPLOMACY")}
          className={`p-2.5 rounded-2xl transition-all ${
            activeTab === "DIPLOMACY"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "text-slate-500 hover:text-slate-200"
          }`}
        >
          <Globe size={20} />
        </button>
      </div>

      {activeTab && (
        <div className="w-80 bg-slate-900/95 border-r border-slate-800 p-5 flex flex-col gap-4 overflow-y-auto pointer-events-auto shadow-2xl relative animate-in slide-in-from-left duration-200">
          <button
            onClick={() => setActiveTab(null)}
            className="absolute top-5 right-5 text-slate-500 hover:text-slate-300"
          >
            <X size={16} />
          </button>

          <div className="border-b border-slate-800 pb-4">
            <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
              Sovereign Console
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight mt-0.5">
              {activeTab} PANEL
            </h2>
          </div>

          <div className="space-y-4 flex-1">
            {activeTab === "STATS" && (
              <>
                <SovereignStatsPanel nation={humanNation} />
                <GlobalLeaderboardPanel
                  ranks={rankings}
                  nations={gameState.nations}
                  humanNationId={playerNationId}
                />
              </>
            )}

            {activeTab === "ECONOMY" && (
              <>
                <StateUpgradesPanel
                  infraLevel={humanNation.geography.infrastructureLevel}
                  industrialLevel={humanNation.industrialLevel}
                  currentTaxRate={humanNation.taxRate}
                  onTaxChange={onTaxChange}
                  onUpgradeInfra={onUpgradeInfra}
                  onUpgradeIndustrial={onUpgradeIndustrial}
                />
                <UnlockedDoctrinesPanel
                  doctrines={humanNation.doctrines}
                  onUnlock={onUnlockDoctrine}
                />
              </>
            )}

            {activeTab === "MILITARY" && (
              <MilitaryRecruitmentPanel
                military={humanNation.military}
                onRecruit={onRecruit}
              />
            )}

            {activeTab === "MARKET" && (
              <MarketExchangePanel
                prices={gameState.marketPrices}
                oilInventory={humanNation.resources.oil}
                steelInventory={humanNation.resources.steel}
                onBuyResource={onBuyResource}
              />
            )}

            {activeTab === "DIPLOMACY" && (
              <DiplomaticRelationsPanel
                targetCountryName="Global Allies"
                relations={humanNation.relations}
                onPropose={onPropose}
                onDeclareWar={onDeclareWar}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
