import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { EconomicDoctrineStance } from "@/domain/politics/economic-doctrine.schema";
import { ECONOMIC_DOCTRINE_CONFIGS } from "@/domain/politics/economic-doctrine.config";
import { StabilityBracketUtility } from "@/domain/politics/stability-bracket.utility";

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
  public static readonly AI_REVENUE_MULTIPLIER = 1.4;

  public static calculate(
    nation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): FiscalRevenueBreakdown {
    const gdp = getNationGdp(nation, provincesMap);
    const stance: EconomicDoctrineStance =
      nation.economicStance || "BALANCED_MIXED";
    const config = ECONOMIC_DOCTRINE_CONFIGS[stance];

    const domesticBase = Math.floor(gdp * 0.08);

    let totalPeaceGdp = 0;
    let totalWorldGdp = 0;
    let activePeacePartnersCount = 0;

    if (nationsMap) {
      const allNations = Object.values(nationsMap);
      for (let i = 0; i < allNations.length; i++) {
        const other = allNations[i]!;
        if (!other.isAlive) continue;

        const partnerGdp = getNationGdp(other, provincesMap);
        totalWorldGdp += partnerGdp;

        if (other.id === nation.id) continue;

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

    const aiMultiplier = nation.isAi ? this.AI_REVENUE_MULTIPLIER : 1.0;
    const domesticRevenue = Math.floor(
      domesticBase * config.domesticWeight * aiMultiplier,
    );
    const globalRevenue = Math.floor(
      globalBase * config.globalWeight * aiMultiplier,
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
