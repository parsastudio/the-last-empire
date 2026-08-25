import React from "react";
import { MilitaryForcesSection } from "@/presentation/components/tactical-map/sidebar/military-forces-section";
import { RecruitmentQueueCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/recruitment-queue-card";
import { MilitaryValuationCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/military-valuation-card";
import { MilitaryTechUpgradeCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/military-tech-upgrade-card";
import { Nation } from "@/domain/nation/nation.schema";

interface MilitaryOverviewTabProps {
  nation: Nation;
}

export function MilitaryOverviewTab({ nation }: MilitaryOverviewTabProps) {
  return (
    <div className="space-y-6 animate-fade-smooth dir-rtl text-right">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <MilitaryForcesSection
          infantry={nation.military.infantry}
          armor={nation.military.armor}
          airDefense={nation.military.airDefense}
          airForce={nation.military.airForce}
          droneMissile={nation.military.droneMissile}
          navalFleet={nation.military.navalFleet}
          techLevel={nation.military.techLevel}
          experience={nation.military.experience}
          nation={nation}
        />

        <div className="space-y-4">
          <MilitaryValuationCard
            military={nation.military}
            industrialLevel={nation.industrialLevel}
            nationId={nation.id}
            nation={nation}
          />
          <MilitaryTechUpgradeCard
            nationId={nation.id}
            treasury={nation.treasury}
            techLevel={nation.military.techLevel}
          />
          <RecruitmentQueueCard
            queue={nation.recruitmentQueue}
            nationId={nation.id}
          />
        </div>
      </div>
    </div>
  );
}
