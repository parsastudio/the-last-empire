import {
  Nation,
  Province,
  getNationGdp,
  NationGettersUtility,
  NationRelationResolver,
  EconomicDoctrineStance,
  ECONOMIC_DOCTRINE_CONFIGS,
} from "@geopolitics/domain";

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
  stabilityImpact: number;
  stance: EconomicDoctrineStance;
}

export class FiscalRevenueCalculator {
  public static calculate(
    nation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): FiscalRevenueBreakdown {
    const gdp = getNationGdp(nation, provincesMap);
    const stance: EconomicDoctrineStance =
      nation.economicStance || "BALANCED_MIXED";
    const config = ECONOMIC_DOCTRINE_CONFIGS[stance];

    const domesticBase = Math.floor(gdp * 0.5);

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
    const exportPower = Math.floor(gdp * 1.0 * marketAccessRatio);

    const hasSea = NationGettersUtility.hasSeaAccess(nation.id, provincesMap);
    const seaFactor = hasSea ? 1.0 : 0.5;
    const transitGateway = Math.floor(totalPeaceGdp * 0.0003 * seaFactor);

    const globalBase = exportPower + transitGateway;

    const domesticRevenue = Math.floor(domesticBase * config.domesticWeight);
    const globalRevenue = Math.floor(globalBase * config.globalWeight);
    const totalRevenue = domesticRevenue + globalRevenue;

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
      stabilityImpact: config.stabilityDelta,
      stance,
    };
  }
}
