import React from "react";
import { TaxControlCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/tax-control-card";
import { TariffControlCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/tariff-control-card";
import { ImfLoanCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/imf-loan-card";
import { ActiveModifiersCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/active-modifiers-card";
import { PopulationWelfareCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/population-welfare-card";
import { DevelopmentUpgradesSection } from "@/presentation/components/tactical-map/command-center/views/components/development-upgrades-section";
import { Nation } from "@/domain/nation/nation.schema";

interface WidePoliticsViewProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
}

export function WidePoliticsView({
  nation,
  nationsMap,
}: WidePoliticsViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
        <ActiveModifiersCard modifiers={nation.activeModifiers} />
        <PopulationWelfareCard
          population={nation.population}
          oilStock={nation.resources.oil}
          gdp={nation.gdp}
          nation={nation}
        />
        <TaxControlCard
          taxRate={nation.taxRate}
          baseGdp={nation.gdp}
          nationId={nation.id}
        />
      </div>

      <div className="space-y-5">
        <TariffControlCard
          initialTariffRate={nation.tariffRate}
          nationId={nation.id}
          hasSeaAccess={nation.geography.hasSeaAccess}
          gdp={nation.gdp}
          nationsMap={nationsMap}
          nation={nation}
        />
        <ImfLoanCard
          nationId={nation.id}
          nationalDebt={nation.nationalDebt}
          gdp={nation.gdp}
          treasury={nation.treasury}
          nation={nation}
        />
      </div>

      <div className="space-y-5">
        <DevelopmentUpgradesSection
          nationId={nation.id}
          treasury={nation.treasury}
          gdp={nation.gdp}
          industrialLevel={nation.industrialLevel}
          infrastructureLevel={nation.geography.infrastructureLevel}
        />
      </div>
    </div>
  );
}
