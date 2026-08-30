import React from "react";
import { EconomicDoctrineControlCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/economic-doctrine-control-card";
import { ImfLoanCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/imf-loan-card";
import { ActiveModifiersCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/active-modifiers-card";
import { IndustryTechUpgradeCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/industry-tech-upgrade-card";
import { MilitaryTechUpgradeCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/military-tech-upgrade-card";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

interface WidePoliticsViewProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
}

export function WidePoliticsView({
  nation,
  nationsMap,
  provincesMap,
}: WidePoliticsViewProps) {
  const gdp = getNationGdp(nation, provincesMap);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200 dir-rtl text-right font-sans">
      <div className="space-y-5">
        <EconomicDoctrineControlCard
          nation={nation}
          nationsMap={nationsMap}
          provincesMap={provincesMap}
        />
        <ActiveModifiersCard modifiers={nation.activeModifiers} />
      </div>

      <div className="space-y-5">
        <IndustryTechUpgradeCard
          nationId={nation.id}
          treasury={nation.treasury}
          industrialLevel={nation.industrialLevel}
        />

        <MilitaryTechUpgradeCard
          nationId={nation.id}
          treasury={nation.treasury}
          techLevel={nation.military.techLevel}
          gdp={gdp}
          provincesMap={provincesMap}
        />

        <ImfLoanCard
          nationId={nation.id}
          nationalDebt={nation.nationalDebt}
          gdp={gdp}
          treasury={nation.treasury}
        />
      </div>
    </div>
  );
}
