import React from "react";
import { MilitaryForcesSection } from "@/presentation/components/tactical-map/sidebar/military-forces-section";
import { RecruitmentQueueCard } from "@/presentation/components/tactical-map/sidebar/tabs/military/recruitment-queue-card";
import { MilitaryExpansionView } from "@/presentation/components/tactical-map/sidebar/tabs/military/military-expansion-view";
import {
  MilitaryStack,
  RecruitmentOrder,
} from "@/domain/military/military.schema";

interface WideMilitaryViewProps {
  military: MilitaryStack;
  recruitmentQueue?: RecruitmentOrder[];
  nationId: string;
  treasury?: number;
  manpower?: number;
  population?: number;
  stability?: number;
}

export function WideMilitaryView({
  military,
  recruitmentQueue = [],
  nationId,
  treasury = 100000,
  manpower = 500,
}: WideMilitaryViewProps) {
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

        <RecruitmentQueueCard queue={recruitmentQueue} nationId={nationId} />
      </div>

      <div className="space-y-5">
        <MilitaryExpansionView
          nationId={nationId}
          treasury={treasury}
          manpower={manpower}
        />
      </div>
    </div>
  );
}
