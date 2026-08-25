import React from "react";
import { MilitaryForcesSection } from "@/presentation/components/tactical-map/sidebar/military-forces-section";
import { RecruitmentQueueCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/recruitment-queue-card";
import { MilitaryExpansionView } from "@/presentation/components/tactical-map/sidebar/tabs/military/military-expansion-view";
import { MilitaryValuationCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/military-valuation-card";
import {
  MilitaryStack,
  RecruitmentOrder,
} from "@/domain/military/military.schema";

interface WideMilitaryViewProps {
  military: MilitaryStack;
  recruitmentQueue?: RecruitmentOrder[];
  nationId: string;
  treasury?: number;
  industrialLevel?: number;
}

export function WideMilitaryView({
  military,
  recruitmentQueue = [],
  nationId,
  treasury = 100000,
  industrialLevel = 1,
}: WideMilitaryViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <MilitaryForcesSection
          infantry={military.infantry}
          armor={military.armor}
          airDefense={military.airDefense}
          airForce={military.airForce}
          droneMissile={military.droneMissile}
          navalFleet={military.navalFleet}
          techLevel={military.techLevel}
          experience={military.experience}
        />

        <div className="space-y-4">
          <MilitaryValuationCard
            military={military}
            industrialLevel={industrialLevel}
            nationId={nationId}
          />
          <RecruitmentQueueCard queue={recruitmentQueue} nationId={nationId} />
        </div>
      </div>

      <MilitaryExpansionView
        nationId={nationId}
        treasury={treasury}
        techLevel={military.techLevel}
        industrialLevel={industrialLevel}
      />
    </div>
  );
}
