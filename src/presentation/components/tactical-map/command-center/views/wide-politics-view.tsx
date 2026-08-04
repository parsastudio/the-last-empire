import React from "react";
import { TaxControlCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/tax-control-card";
import { TariffControlCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/tariff-control-card";
import { ImfLoanCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/imf-loan-card";
import { AntiCorruptionCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/anti-corruption-card";
import { ActiveModifiersCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/active-modifiers-card";
import { PopulationWelfareCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/population-welfare-card";
import { DevelopmentUpgradesSection } from "@/presentation/components/tactical-map/command-center/views/components/development-upgrades-section";
import { ActiveModifier, Nation } from "@/domain/nation/nation.schema";

interface WidePoliticsViewProps {
  nationId: string;
  gdp?: number;
  treasury?: number;
  turnsInPower?: number;
  taxRate: number;
  corruption?: number;
  governmentType: string;
  nationalDebt?: number;
  tariffRate?: number;
  industrialLevel?: number;
  infrastructureLevel?: number;
  militaryTechLevel?: number;
  hasSeaAccess?: boolean;
  activeModifiers?: ActiveModifier[];
  nationsMap?: Record<string, Nation>;
  population?: number;
  oilStock?: number;
  steelStock?: number;
  globalReputation?: number;
}

export function WidePoliticsView({
  nationId,
  gdp = 450000000000,
  treasury = 100000,
  taxRate,
  corruption = 0,
  nationalDebt = 0,
  tariffRate = 10,
  industrialLevel = 1,
  infrastructureLevel = 1,
  militaryTechLevel = 1,
  hasSeaAccess = true,
  activeModifiers = [],
  nationsMap,
  population = 80000000,
  oilStock = 1000,
  steelStock = 1000,
}: WidePoliticsViewProps) {
  const currentNation = nationsMap ? nationsMap[nationId] : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
        <ActiveModifiersCard modifiers={activeModifiers} />
        <PopulationWelfareCard
          population={population}
          oilStock={oilStock}
          steelStock={steelStock}
          gdp={gdp}
          nation={currentNation}
        />
        <TaxControlCard
          taxRate={taxRate}
          baseGdp={gdp}
          corruption={corruption}
          nationId={nationId}
        />
      </div>

      <div className="space-y-5">
        <TariffControlCard
          initialTariffRate={tariffRate}
          nationId={nationId}
          hasSeaAccess={hasSeaAccess}
          gdp={gdp}
          nationsMap={nationsMap}
          nation={currentNation}
        />
        <ImfLoanCard
          nationId={nationId}
          nationalDebt={nationalDebt}
          gdp={gdp}
          treasury={treasury}
        />
        <AntiCorruptionCard
          nationId={nationId}
          treasury={treasury}
          gdp={gdp}
          currentCorruption={corruption}
        />
      </div>

      <div className="space-y-5">
        <DevelopmentUpgradesSection
          nationId={nationId}
          treasury={treasury}
          gdp={gdp}
          industrialLevel={industrialLevel}
          infrastructureLevel={infrastructureLevel}
          militaryTechLevel={militaryTechLevel}
        />
      </div>
    </div>
  );
}
