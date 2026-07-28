import React from "react";
import { MilitaryForcesSection } from "../../sidebar/military-forces-section";
import { RecruitmentQueueCard } from "../../sidebar/tabs/military/recruitment-queue-card";
import { DisbandUnitCard } from "../../sidebar/tabs/military/disband-unit-card";
import { MilitaryExpansionView } from "../../sidebar/tabs/military/military-expansion-view";
import { MilitaryStack } from "@/domain/military/military.schema";

interface WideMilitaryViewProps {
  military: MilitaryStack;
}

export function WideMilitaryView({ military }: WideMilitaryViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
        <MilitaryForcesSection
          infantry={military.infantry}
          airForce={military.airForce}
          droneMissile={military.droneMissile}
          techLevel={military.techLevel}
          experience={military.experience}
        />

        <RecruitmentQueueCard />
        <DisbandUnitCard />
      </div>

      <div className="space-y-5">
        <MilitaryExpansionView />
      </div>
    </div>
  );
}
