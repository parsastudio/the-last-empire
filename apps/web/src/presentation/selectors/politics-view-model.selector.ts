import {
  Nation,
  Province,
  EconomicDoctrineStance,
  ECONOMIC_DOCTRINE_CONFIGS,
  NationGettersUtility,
} from "@geopolitics/domain";
import {
  FiscalRevenueCalculator,
  StabilityCalculator,
  FiscalRevenueBreakdown,
} from "@geopolitics/game-engine";

export interface EconomicDoctrinePreviewViewModel {
  selectedStance: EconomicDoctrineStance;
  hasSeaAccess: boolean;
  activeConfig: (typeof ECONOMIC_DOCTRINE_CONFIGS)[EconomicDoctrineStance];
  preview: FiscalRevenueBreakdown;
}

export interface GovernmentStabilityViewModel {
  stability: number;
  reputation: number;
  stabilityDelta: number;
}

export function selectGovernmentStabilityViewModel(
  nation: Nation | null | undefined,
): GovernmentStabilityViewModel {
  const stability = nation ? nation.government.stability : 50;
  const reputation = nation ? nation.globalReputation : 0;
  const stabilityDelta = nation
    ? StabilityCalculator.calculateTurnStabilityDelta(nation)
    : 0;

  return {
    stability,
    reputation,
    stabilityDelta,
  };
}

export function selectEconomicDoctrinePreview(
  nation: Nation,
  selectedStance: EconomicDoctrineStance,
  nationsMap?: Record<string, Nation>,
  provincesMap?: Record<string, Province>,
): EconomicDoctrinePreviewViewModel {
  const previewNation: Nation = {
    ...nation,
    economicStance: selectedStance,
  };

  const preview = FiscalRevenueCalculator.calculate(
    previewNation,
    nationsMap,
    provincesMap,
  );

  const hasSeaAccess = NationGettersUtility.hasSeaAccess(
    nation.id,
    provincesMap,
  );

  return {
    selectedStance,
    hasSeaAccess,
    activeConfig: ECONOMIC_DOCTRINE_CONFIGS[selectedStance],
    preview,
  };
}
