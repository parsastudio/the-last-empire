import React from "react";
import { MilitaryForcesSection } from "@/presentation/components/tactical-map/sidebar/military-forces-section";
import { MilitaryValuationCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/military-valuation-card";
import { MilitaryReadinessCard } from "@/presentation/components/tactical-map/sidebar/components/military-readiness-card";
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
    <div className="space-y-6 animate-fade-smooth text-start font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7">
          <MilitaryForcesSection nation={nation} provincesMap={provincesMap} />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <MilitaryValuationCard
            military={nation.military}
            nationId={nation.id}
            nation={nation}
            provincesMap={provincesMap}
          />
          <MilitaryReadinessCard techLevel={nation.military.techLevel} />
        </div>
      </div>
    </div>
  );
}
