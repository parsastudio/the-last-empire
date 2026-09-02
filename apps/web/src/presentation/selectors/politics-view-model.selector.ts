import {
  Nation,
  Province,
  EconomicDoctrineStance,
  ECONOMIC_DOCTRINE_CONFIGS,
  NationGettersUtility,
  getNationGdp,
} from "@geopolitics/domain";
import {
  FiscalRevenueCalculator,
  FiscalRevenueBreakdown,
} from "@geopolitics/game-engine";

export interface EconomicDoctrinePreviewViewModel {
  selectedStance: EconomicDoctrineStance;
  hasSeaAccess: boolean;
  activeConfig: (typeof ECONOMIC_DOCTRINE_CONFIGS)[EconomicDoctrineStance];
  preview: FiscalRevenueBreakdown;
  nationGdp: number;
  gdpPercentage: number;
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

  const nationGdp = getNationGdp(nation, provincesMap);
  const gdpPercentage =
    nationGdp > 0
      ? Number(((preview.totalRevenue / nationGdp) * 100).toFixed(2))
      : 0;

  return {
    selectedStance,
    hasSeaAccess,
    activeConfig: ECONOMIC_DOCTRINE_CONFIGS[selectedStance],
    preview,
    nationGdp,
    gdpPercentage,
  };
}
