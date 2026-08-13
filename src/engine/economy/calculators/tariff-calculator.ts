import { Nation } from "@/domain/nation/nation.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

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
    const nationGdp = getNationGdp(nation);
    const nationNavalPower =
      (nation.military.navalFleet || 0) * (nation.military.techLevel || 1);

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

        const isWar = rel?.stance === "WAR";
        const isSevered =
          isWar ||
          rel?.stance === "SEVERED_RELATIONS" ||
          rel?.isTradeEmbargoed === true;

        const partnerNavalPower =
          (partner.military.navalFleet || 0) *
          (partner.military.techLevel || 1);

        const isNavalBlockaded = isWar && partnerNavalPower > nationNavalPower;

        if (!isSevered && !isNavalBlockaded) {
          activePartnerCount++;
          const partnerGdp = getNationGdp(partner);
          const minGdp = Math.min(nationGdp, partnerGdp);
          totalBaseRevenue +=
            minGdp * (tariffRate / 100) * 0.04 * seaAccessFactor;
        }
      }
    } else {
      totalPartnerCount = 25;
      activePartnerCount = 25;
      totalBaseRevenue =
        nationGdp * 25 * (tariffRate / 100) * 0.04 * seaAccessFactor;
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
