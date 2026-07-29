import React from "react";
import { TaxControlCard } from "../../sidebar/tabs/politics/tax-control-card";
import { TariffControlCard } from "../../sidebar/tabs/politics/tariff-control-card";
import { ImfLoanCard } from "../../sidebar/tabs/politics/imf-loan-card";
import { IndustrialUpgradeCard } from "../../sidebar/tabs/politics/industrial-upgrade-card";
import { InfrastructureUpgradeCard } from "../../sidebar/tabs/politics/infrastructure-upgrade-card";
import { ProxyWarCard } from "../../sidebar/tabs/politics/proxy-war-card";
import { RegimeChangeCard } from "../../sidebar/tabs/politics/regime-change-card";
import { AntiCorruptionCard } from "../../sidebar/tabs/politics/anti-corruption-card";
import { ActiveModifiersCard } from "../../sidebar/tabs/politics/active-modifiers-card";
import { ActiveModifier } from "@/domain/nation/nation.schema";

interface WidePoliticsViewProps {
  nationId?: string;
  gdp?: number;
  taxRate: number;
  governmentType: string;
  nationalDebt?: number;
  tariffRate?: number;
  industrialLevel?: number;
  infrastructureLevel?: number;
  activeModifiers?: ActiveModifier[];
}

export function WidePoliticsView({
  nationId = "NATION_118",
  gdp = 450000000000,
  taxRate,
  governmentType,
  nationalDebt = 0,
  tariffRate = 10,
  industrialLevel = 1,
  infrastructureLevel = 1,
  activeModifiers = [],
}: WidePoliticsViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
        <ActiveModifiersCard modifiers={activeModifiers} />
        <TaxControlCard taxRate={taxRate} baseGdp={gdp} nationId={nationId} />
        <TariffControlCard initialTariffRate={tariffRate} />
      </div>

      <div className="space-y-5">
        <ImfLoanCard
          nationId={nationId}
          nationalDebt={nationalDebt}
          gdp={gdp}
        />
        <IndustrialUpgradeCard
          currentLevel={industrialLevel}
          nationId={nationId}
        />
        <InfrastructureUpgradeCard
          currentLevel={infrastructureLevel}
          nationId={nationId}
        />
      </div>

      <div className="space-y-5">
        <ProxyWarCard nationId={nationId} />
        <RegimeChangeCard governmentType={governmentType} nationId={nationId} />
        <AntiCorruptionCard nationId={nationId} />
      </div>
    </div>
  );
}
