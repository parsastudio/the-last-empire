import React from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";
import { TacticalControlPanel } from "../panel/tactical-control-panel";
import { DiplomaticRelationsPanel } from "../panel/diplomatic-relations-panel";
import { MarketExchangePanel } from "../panel/market-exchange-panel";
import { MilitaryRecruitmentPanel } from "../panel/military-recruitment-panel";
import { StateUpgradesPanel } from "../panel/state-upgrades-panel";
import { UnlockedDoctrinesPanel } from "../panel/unlocked-doctrines-panel";

interface HoveredCountryProps {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

interface RightContextSidebarProps {
  gameState: GameState;
  playerNationId: string;
  humanNation: Nation;
  hoveredCountry: HoveredCountryProps | null;
  forceSuccess: boolean;
  onToggleForceSuccess: () => void;
  onPropose: (type: DiplomaticProposalType) => void;
  onDeclareWar: () => void;
  onTaxChange: (rate: number) => void;
  onUpgradeInfra: () => void;
  onUpgradeIndustrial: () => void;
  onUnlockDoctrine: (id: string) => void;
  onRecruit: (type: UnitType, qty: number) => void;
  onBuyResource: (type: "oil" | "steel", amt: number) => void;
}

export function RightContextSidebar({
  gameState,
  playerNationId,
  humanNation,
  hoveredCountry,
  forceSuccess,
  onToggleForceSuccess,
  onPropose,
  onDeclareWar,
  onTaxChange,
  onUpgradeInfra,
  onUpgradeIndustrial,
  onUnlockDoctrine,
  onRecruit,
  onBuyResource,
}: RightContextSidebarProps) {
  return (
    <div className="absolute top-20 right-4 w-80 space-y-3 z-40 max-h-[85vh] overflow-y-auto pr-1">
      <TacticalControlPanel
        forceSuccess={forceSuccess}
        onToggleForceSuccess={onToggleForceSuccess}
      />
      {hoveredCountry && hoveredCountry.code !== playerNationId && (
        <DiplomaticRelationsPanel
          targetCountryName={hoveredCountry.name}
          onPropose={onPropose}
          onDeclareWar={onDeclareWar}
          relations={humanNation.relations}
        />
      )}
      <MarketExchangePanel
        prices={gameState.marketPrices}
        oilInventory={humanNation.resources.oil}
        steelInventory={humanNation.resources.steel}
        onBuyResource={onBuyResource}
      />
      <MilitaryRecruitmentPanel
        military={humanNation.military}
        onRecruit={onRecruit}
      />
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
    </div>
  );
}
