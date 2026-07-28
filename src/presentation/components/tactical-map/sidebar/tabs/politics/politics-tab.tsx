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
import { Nation } from "@/domain/nation/nation.schema";

interface PoliticsTabProps {
  nation: Nation;
}

export function PoliticsTab({ nation }: PoliticsTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
      <ActiveModifiersCard modifiers={nation.activeModifiers} />
      <TaxControlCard
        taxRate={nation.taxRate}
        baseGdp={nation.gdp}
        nationId={nation.id}
      />
      <TariffControlCard initialTariffRate={nation.tariffRate} />
      <ImfLoanCard nationId={nation.id} nationalDebt={nation.nationalDebt} />
      <IndustrialUpgradeCard
        currentLevel={nation.industrialLevel}
        nationId={nation.id}
      />
      <InfrastructureUpgradeCard
        currentLevel={nation.geography.infrastructureLevel}
        nationId={nation.id}
      />
      <ProxyWarCard nationId={nation.id} />
      <RegimeChangeCard
        governmentType={nation.government.type}
        nationId={nation.id}
      />
      <AntiCorruptionCard nationId={nation.id} />
    </div>
  );
}
