import React from "react";
import { MilitaryForcesSection } from "../../military-forces-section";
import { MilitaryActionsCard } from "./military-actions-card";

interface MilitaryTabProps {
  military: {
    infantry: number;
    airForce: number;
    droneMissile: number;
    experience: number;
    techLevel: number;
  };
}

export function MilitaryTab({ military }: MilitaryTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <MilitaryForcesSection
        infantry={military.infantry}
        airForce={military.airForce}
        droneMissile={military.droneMissile}
        techLevel={military.techLevel}
        experience={military.experience}
      />
      <MilitaryActionsCard />
    </div>
  );
}
