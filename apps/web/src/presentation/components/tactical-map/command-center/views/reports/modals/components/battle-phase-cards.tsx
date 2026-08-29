import React from "react";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { BattlePhaseMissileCard } from "./battle-phase-missile-card";
import { BattlePhaseAirCard } from "./battle-phase-air-card";
import { BattlePhaseGroundCard } from "./battle-phase-ground-card";

interface BattlePhaseCardsProps {
  activeStep: 1 | 2 | 3;
  reportData: BattleFullReportData;
  attackerName: string;
  defenderName: string;
  attackerFlag: string;
  defenderFlag: string;
}

export function BattlePhaseCards({
  activeStep,
  reportData,
  attackerName,
  defenderName,
  attackerFlag,
  defenderFlag,
}: BattlePhaseCardsProps) {
  if (activeStep === 1) {
    return (
      <BattlePhaseMissileCard
        reportData={reportData}
        attackerName={attackerName}
        defenderName={defenderName}
        attackerFlag={attackerFlag}
        defenderFlag={defenderFlag}
      />
    );
  }

  if (activeStep === 2) {
    return (
      <BattlePhaseAirCard
        reportData={reportData}
        attackerName={attackerName}
        defenderName={defenderName}
        attackerFlag={attackerFlag}
        defenderFlag={defenderFlag}
      />
    );
  }

  return (
    <BattlePhaseGroundCard
      reportData={reportData}
      attackerName={attackerName}
      defenderName={defenderName}
      attackerFlag={attackerFlag}
      defenderFlag={defenderFlag}
    />
  );
}
