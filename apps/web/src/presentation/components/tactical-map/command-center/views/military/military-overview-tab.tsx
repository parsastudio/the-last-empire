import React from "react";
import { MilitaryForcesSection } from "@/presentation/components/tactical-map/sidebar/military-forces-section";
import { MilitaryValuationCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/military-valuation-card";
import { MilitaryTechUpgradeCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/military-tech-upgrade-card";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";

interface MilitaryOverviewTabProps {
  nation: Nation;
  provincesMap?: Record<string, Province>;
}

export function MilitaryOverviewTab({
  nation,
  provincesMap,
}: MilitaryOverviewTabProps) {
  return (
    <div className="space-y-6 animate-fade-smooth dir-rtl text-right">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <MilitaryForcesSection nation={nation} provincesMap={provincesMap} />

        <div className="space-y-4">
          <MilitaryValuationCard
            military={nation.military}
            industrialLevel={nation.industrialLevel}
            nationId={nation.id}
            nation={nation}
            provincesMap={provincesMap}
          />
          <MilitaryTechUpgradeCard
            nationId={nation.id}
            treasury={nation.treasury}
            techLevel={nation.military.techLevel}
          />
        </div>
      </div>
    </div>
  );
}
