import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { EconomicDoctrineStance } from "@/domain/politics/economic-doctrine.schema";
import { ECONOMIC_DOCTRINE_CONFIGS } from "@/domain/politics/economic-doctrine.config";
import { StabilityBracketUtility } from "@/domain/politics/stability-bracket.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { NationalProjectEffectApplierUtility } from "@/domain/projects/national-project-effect-applier.utility";

export interface FiscalRevenueBreakdown {
  totalRevenue: number;
  domesticRevenue: number;
  globalRevenue: number;
  domesticBase: number;
  globalBase: number;
  exportPower: number;
  transitGateway: number;
  activePeacePartnersCount: number;
  totalPeacePartnersGdp: number;
  stance: EconomicDoctrineStance;
  stabilityMultiplier: number;
  stabilityDeltaRevenue: number;
}

export class FiscalRevenueCalculator {
  public static readonly DEFAULT_AI_REVENUE_MULTIPLIER = 1.4;

  public static calculate(
    nation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
    aiRevenueMultiplier: number = FiscalRevenueCalculator.DEFAULT_AI_REVENUE_MULTIPLIER,
    precomputedGdpMap?: Map<string, number>,
    precomputedTotalWorldGdp?: number,
  ): FiscalRevenueBreakdown {
    const canonicalNationId = CountryRegistry.resolveCanonicalId(nation.id);
    const gdp =
      precomputedGdpMap?.get(canonicalNationId) ??
      getNationGdp(nation, provincesMap);

    const stance: EconomicDoctrineStance =
      nation.economicStance || "BALANCED_MIXED";
    const config = ECONOMIC_DOCTRINE_CONFIGS[stance];

    const factoryYieldProjectMultiplier =
      NationalProjectEffectApplierUtility.getCombinedMultiplier(
        nation.completedProjectIds,
        "factoryYieldBonusMultiplier",
      );

    const domesticBase = Math.floor(gdp * 0.08 * factoryYieldProjectMultiplier);

    let totalPeaceGdp = 0;
    let totalWorldGdp = precomputedTotalWorldGdp ?? 0;
    let activePeacePartnersCount = 0;

    if (nationsMap) {
      const allNations = Object.values(nationsMap);
      const needWorldGdp = totalWorldGdp <= 0;

      for (let i = 0; i < allNations.length; i++) {
        const other = allNations[i]!;
        if (!other.isAlive) continue;

        const otherCanonical = CountryRegistry.resolveCanonicalId(other.id);
        const partnerGdp =
          precomputedGdpMap?.get(otherCanonical) ??
          getNationGdp(other, provincesMap);

        if (needWorldGdp) {
          totalWorldGdp += partnerGdp;
        }

        if (otherCanonical === canonicalNationId) continue;

        const isEmbargoed = NationRelationResolver.isTradeEmbargoed(
          nation,
          other,
        );

        if (!isEmbargoed) {
          activePeacePartnersCount++;
          totalPeaceGdp += partnerGdp;
        }
      }
    } else {
      totalPeaceGdp = gdp * 80;
      totalWorldGdp = gdp * 100;
      activePeacePartnersCount = 100;
    }

    const marketAccessRatio =
      totalWorldGdp > 0 ? totalPeaceGdp / totalWorldGdp : 0;
    const exportPower = Math.floor(gdp * 0.1 * marketAccessRatio);

    const hasSea = NationGettersUtility.hasSeaAccess(nation.id, provincesMap);
    const seaFactor = hasSea ? 1.0 : 0.5;
    const transitGateway = Math.floor(totalPeaceGdp * 0.0003 * seaFactor);
    const globalBase = exportPower + transitGateway;

    const globalTradeProjectMultiplier =
      NationalProjectEffectApplierUtility.getCombinedMultiplier(
        nation.completedProjectIds,
        "globalTradeIncomeBonusMultiplier",
      );

    const appliedAiMultiplier = nation.isAi ? aiRevenueMultiplier : 1.0;
    const domesticRevenue = Math.floor(
      domesticBase * config.domesticWeight * appliedAiMultiplier,
    );
    const globalRevenue = Math.floor(
      globalBase *
        config.globalWeight *
        appliedAiMultiplier *
        globalTradeProjectMultiplier,
    );
    const baseTotalRevenue = domesticRevenue + globalRevenue;

    const stability = nation.government?.stability ?? 50;
    const stabilityMultiplier =
      StabilityBracketUtility.getRevenueMultiplier(stability);
    const totalRevenue = Math.floor(baseTotalRevenue * stabilityMultiplier);
    const stabilityDeltaRevenue = totalRevenue - baseTotalRevenue;

    return {
      totalRevenue,
      domesticRevenue,
      globalRevenue,
      domesticBase,
      globalBase,
      exportPower,
      transitGateway,
      activePeacePartnersCount,
      totalPeacePartnersGdp: totalPeaceGdp,
      stance,
      stabilityMultiplier,
      stabilityDeltaRevenue,
    };
  }
}
