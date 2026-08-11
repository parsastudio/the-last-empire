import { Nation } from "@/domain/nation/nation.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { CountryRegistry } from "@/domain/data/countries";

export interface TariffEffectResult {
  tariffRevenue: number;
  stabilityImpact: number;
  tradeVolumePercentage: number;
}

export class TariffCalculator {
  public static calculateTariffEffects(
    nation: Nation,
    nationsMap?: Record<string, Nation>,
  ): TariffEffectResult {
    const tariffRate = nation.tariffRate;
    const seaAccessFactor = nation.geography.hasSeaAccess ? 1.0 : 0.5;

    let totalBaseRevenue = 0;
    let activePartnerCount = 0;
    let totalPartnerCount = 0;

    if (nationsMap && Object.keys(nationsMap).length > 1) {
      const partners = Object.values(nationsMap).filter(
        (p) => p.id !== nation.id && p.isAlive,
      );
      totalPartnerCount = partners.length;

      for (const partner of partners) {
        const canonicalPartnerId = CountryRegistry.resolveCanonicalId(
          partner.id,
        );
        const rel =
          nation.relations?.[partner.id] ||
          nation.relations?.[canonicalPartnerId];

        const isSevered =
          rel?.stance === "WAR" ||
          rel?.stance === "SEVERED_RELATIONS" ||
          rel?.isTradeEmbargoed === true;

        if (!isSevered) {
          activePartnerCount++;
          const minGdp = Math.min(nation.gdp, partner.gdp);
          totalBaseRevenue +=
            minGdp * (tariffRate / 100) * 0.04 * seaAccessFactor;
        }
      }
    } else {
      totalPartnerCount = 25;
      activePartnerCount = 25;
      totalBaseRevenue =
        nation.gdp * 25 * (tariffRate / 100) * 0.04 * seaAccessFactor;
    }

    const researchMultiplier = DoctrinesManager.getTariffRevenueMultiplier(
      nation.doctrines?.unlockedDoctrines,
    );

    const tariffRevenue = Math.floor(totalBaseRevenue * researchMultiplier);
    const stabilityImpact = Number(((10 - tariffRate) * 0.08).toFixed(2));
    const tradeVolumePercentage =
      totalPartnerCount > 0
        ? Math.round((activePartnerCount / totalPartnerCount) * 100)
        : 100;

    return {
      tariffRevenue,
      stabilityImpact,
      tradeVolumePercentage,
    };
  }
}
