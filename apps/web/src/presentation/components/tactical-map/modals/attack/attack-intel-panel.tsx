import React from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { AuxiliaryGuarantorDefense } from "@/domain/reports/combat-report.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { AttackFogReconCard } from "./components/attack-fog-recon-card";
import { AttackDiscoveredIntelGrid } from "./components/attack-discovered-intel-grid";

export interface TacticalForecast {
  winProbability: number;
  isVictoryPredicted: boolean;
  isCapitulationPredicted: boolean;
  phase1Prediction: string;
  phase2Prediction: string;
  phase3Prediction: string;
  valuationRatio: number;
  phase2Air?: {
    phaseWinner: string;
    attAirForce: number;
    defAirForce: number;
    attAirLost: number;
    defAirLost: number;
  };
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

  const probColor =
    forecast.winProbability >= 75
      ? "text-gdp"
      : forecast.winProbability >= 50
        ? "text-treasury"
        : "text-military";

  const probBg =
    forecast.winProbability >= 75
      ? "bg-gdp/15 border-gdp/30"
      : forecast.winProbability >= 50
        ? "bg-treasury/15 border-treasury/30"
        : "bg-military/15 border-military/30";

  return (
    <div className="space-y-3 font-sans dir-rtl text-right">
      {!isReconActive ? (
        <AttackFogReconCard
          reconCost={reconCost}
          canAffordRecon={canAffordRecon}
          isExecutingRecon={isExecutingRecon}
          winProbability={forecast.winProbability}
          probBg={probBg}
          probColor={probColor}
          onExecuteRecon={onExecuteRecon}
        />
      ) : (
        <AttackDiscoveredIntelGrid
          targetNation={targetNation}
          forecast={forecast}
          probBg={probBg}
          probColor={probColor}
          auxFlag={auxFlag}
          onAutoOptimizeDeploy={onAutoOptimizeDeploy}
        />
      )}
    </div>
  );
}
