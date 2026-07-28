import React from "react";
import { TaxControlCard } from "./tax-control-card";
import { TariffControlCard } from "./tariff-control-card";
import { ImfLoanCard } from "./imf-loan-card";
import { IndustrialUpgradeCard } from "./industrial-upgrade-card";
import { InfrastructureUpgradeCard } from "./infrastructure-upgrade-card";
import { ProxyWarCard } from "./proxy-war-card";
import { RegimeChangeCard } from "./regime-change-card";
import { AntiCorruptionCard } from "./anti-corruption-card";
import { ActiveModifiersCard } from "./active-modifiers-card";

interface PoliticsTabProps {
  taxRate: number;
  governmentType: string;
}

export function PoliticsTab({ taxRate, governmentType }: PoliticsTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <ActiveModifiersCard />
      <TaxControlCard taxRate={taxRate} />
      <TariffControlCard />
      <ImfLoanCard />
      <IndustrialUpgradeCard />
      <InfrastructureUpgradeCard />
      <ProxyWarCard />
      <RegimeChangeCard governmentType={governmentType} />
      <AntiCorruptionCard />
    </div>
  );
}
