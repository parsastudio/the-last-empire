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

interface WidePoliticsViewProps {
  taxRate: number;
  governmentType: string;
}

export function WidePoliticsView({
  taxRate,
  governmentType,
}: WidePoliticsViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
        <ActiveModifiersCard />
        <TaxControlCard taxRate={taxRate} />
        <TariffControlCard />
      </div>

      <div className="space-y-5">
        <ImfLoanCard />
        <IndustrialUpgradeCard />
        <InfrastructureUpgradeCard />
      </div>

      <div className="space-y-5">
        <ProxyWarCard />
        <RegimeChangeCard governmentType={governmentType} />
        <AntiCorruptionCard />
      </div>
    </div>
  );
}
