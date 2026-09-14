import {
  Nation,
  Province,
  EconomicDoctrineStance,
  ECONOMIC_DOCTRINE_CONFIGS,
  NationGettersUtility,
  getNationGdp,
  FiscalRevenueCalculator,
  FiscalRevenueBreakdown,
  GameStateProjections,
  CountryRegistry,
} from "@geopolitics/domain";

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
  projections?: GameStateProjections | null,
): EconomicDoctrinePreviewViewModel {
  const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
  const previewNation: Nation = {
    ...nation,
    economicStance: selectedStance,
  };

  const preview = FiscalRevenueCalculator.calculate(
    previewNation,
    nationsMap,
    provincesMap,
    FiscalRevenueCalculator.DEFAULT_AI_REVENUE_MULTIPLIER,
    projections?.gdpMap,
    projections?.totalWorldGdp,
  );

  const hasSeaAccess = NationGettersUtility.hasSeaAccess(
    nation.id,
    provincesMap,
    undefined,
    projections?.provincesByOwnerMap,
  );

  const nationGdp =
    projections?.gdpMap.get(canonicalId) ?? getNationGdp(nation, provincesMap);
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
