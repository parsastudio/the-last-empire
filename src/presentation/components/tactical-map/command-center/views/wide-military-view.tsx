import React from "react";
import { MilitaryForcesSection } from "../../sidebar/military-forces-section";
import { RecruitmentQueueCard } from "../../sidebar/tabs/military/recruitment-queue-card";
import { DisbandUnitCard } from "../../sidebar/tabs/military/disband-unit-card";
import { MilitaryExpansionView } from "../../sidebar/tabs/military/military-expansion-view";
import {
  MilitaryStack,
  RecruitmentOrder,
} from "@/domain/military/military.schema";

interface WideMilitaryViewProps {
  military: MilitaryStack;
  population?: number;
  stability?: number;
  recruitmentQueue?: RecruitmentOrder[];
  nationId?: string;
  treasury?: number;
  manpower?: number;
  steel?: number;
  activeSubTab?: string | null;
}

export function WideMilitaryView({
  military,
  population = 80000000,
  stability = 70,
  recruitmentQueue = [],
  nationId = "NATION_118",
  treasury = 100000,
  manpower = 500,
  steel = 1000,
}: WideMilitaryViewProps) {
  const militiaGarrisonPower = Math.max(
    10,
    Math.floor((population / 100000) * (stability / 100)),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-5">
        <MilitaryForcesSection
          infantry={military.infantry}
          airForce={military.airForce}
          droneMissile={military.droneMissile}
          techLevel={military.techLevel}
          experience={military.experience}
          militiaGarrisonPower={militiaGarrisonPower}
        />

        <RecruitmentQueueCard queue={recruitmentQueue} nationId={nationId} />
        <DisbandUnitCard nationId={nationId} />
      </div>

      <div className="space-y-5">
        <MilitaryExpansionView
          nationId={nationId}
          treasury={treasury}
          manpower={manpower}
          steel={steel}
        />
      </div>
    </div>
  );
}
