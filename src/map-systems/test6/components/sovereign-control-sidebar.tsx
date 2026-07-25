import React from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";
import { GlobalSimulationControl } from "./global-simulation-control";
import { DiplomacyControlPanel } from "./diplomacy-control-panel";
import { EconomyAdjuster } from "./economy-adjuster";
import { StateUpgradeHub } from "./state-upgrade-hub";
import { DoctrineUnlockedList } from "./doctrine-unlocked-list";
import { RecruitmentCenter } from "./recruitment-center";
import { MarketPricesWidget } from "./market-prices-widget";
import { ActiveWarsList } from "./active-wars-list";
import { AllianceMatrixWidget } from "./alliance-matrix-widget";

interface HoveredCountryProps {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

interface SovereignControlSidebarProps {
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

export function SovereignControlSidebar({
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
}: SovereignControlSidebarProps) {
  return (
    <div className="absolute top-20 right-4 w-72 space-y-3 z-40 max-h-[85vh] overflow-y-auto pr-1">
      <GlobalSimulationControl
        forceSuccess={forceSuccess}
        onToggleForceSuccess={onToggleForceSuccess}
      />
      {hoveredCountry && hoveredCountry.code !== playerNationId && (
        <DiplomacyControlPanel
          targetCountryName={hoveredCountry.name}
          onPropose={onPropose}
          onDeclareWar={onDeclareWar}
        />
      )}
      <EconomyAdjuster
        currentTaxRate={humanNation.taxRate}
        onTaxChange={onTaxChange}
      />
      <StateUpgradeHub
        infraLevel={humanNation.geography.infrastructureLevel}
        industrialLevel={humanNation.industrialLevel}
        onUpgradeInfra={onUpgradeInfra}
        onUpgradeIndustrial={onUpgradeIndustrial}
      />
      <DoctrineUnlockedList
        doctrines={humanNation.doctrines}
        onUnlock={onUnlockDoctrine}
      />
      <RecruitmentCenter
        onRecruit={onRecruit}
        infantryCost={1000}
        airForceCost={1000}
      />
      <MarketPricesWidget
        prices={gameState.marketPrices}
        oilInventory={humanNation.resources.oil}
        steelInventory={humanNation.resources.steel}
        onBuyResource={onBuyResource}
      />
      <ActiveWarsList relations={humanNation.relations} />
      <AllianceMatrixWidget relations={humanNation.relations} />
    </div>
  );
}
