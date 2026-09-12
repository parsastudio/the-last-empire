import React from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { AuxiliaryGuarantorDefense } from "@/domain/reports/combat-report.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { AttackFogReconCard } from "./components/attack-fog-recon-card";
import { AttackDiscoveredIntelGrid } from "./components/attack-discovered-intel-grid";
import { AttackForecastVisualUtility } from "./utils/attack-forecast-visual.utility";

export interface TacticalForecast {
  winProbability: number;
  isVictoryPredicted: boolean;
  isCapitulationPredicted: boolean;
  auxiliaryGuarantor?: AuxiliaryGuarantorDefense;
}

interface AttackIntelPanelProps {
  isReconActive: boolean;
  reconCost: number;
  canAffordRecon: boolean;
  isExecutingRecon: boolean;
  targetNation: Nation;
  forecast: TacticalForecast;
  onExecuteRecon: () => void;
  onAutoOptimizeDeploy: () => void;
}

export function AttackIntelPanel({
  isReconActive,
  reconCost,
  canAffordRecon,
  isExecutingRecon,
  targetNation,
  forecast,
  onExecuteRecon,
  onAutoOptimizeDeploy,
}: AttackIntelPanelProps) {
  const aux = forecast.auxiliaryGuarantor;
  const auxFlag = aux
    ? getFlagEmoji(aux.guarantorFlagCode || aux.guarantorId)
    : "";

  const probStyle = AttackForecastVisualUtility.resolveProbabilityStyle(
    forecast.winProbability,
  );

  return (
    <div className="space-y-3 font-sans text-start">
      {!isReconActive ? (
        <AttackFogReconCard
          reconCost={reconCost}
          canAffordRecon={canAffordRecon}
          isExecutingRecon={isExecutingRecon}
          winProbability={forecast.winProbability}
          probBg={probStyle.bgClass}
          probColor={probStyle.textColorClass}
          onExecuteRecon={onExecuteRecon}
        />
      ) : (
        <AttackDiscoveredIntelGrid
          targetNation={targetNation}
          forecast={forecast}
          probBg={probStyle.bgClass}
          probColor={probStyle.textColorClass}
          auxFlag={auxFlag}
          onAutoOptimizeDeploy={onAutoOptimizeDeploy}
        />
      )}
    </div>
  );
}
