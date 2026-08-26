import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { NationGettersUtility } from "@geopolitics/domain";

export interface TariffEffectResult {
  tariffRevenue: number;
  stabilityImpact: number;
  tradeVolumePercentage: number;
}

export class TariffCalculator {
  public static calculateTariffEffects(
    nation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): TariffEffectResult {
    const tariffRate = Math.min(50, Math.max(0, nation.tariffRate));
    const hasSea = NationGettersUtility.hasSeaAccess(nation.id, provincesMap);
    const seaAccessFactor = hasSea ? 1.0 : 0.5;
    const nationGdp = getNationGdp(nation, provincesMap);
    const nationNavalPower =
      (nation.military.navalFleet || 0) * (nation.military.techLevel || 1);

    let totalEligibleGdp = 0;
    let activePartnerCount = 0;
    let totalPartnerCount = 0;

    if (nationsMap && Object.keys(nationsMap).length > 1) {
      const allNationEntries = Object.values(nationsMap);
      totalPartnerCount = allNationEntries.length - 1;
      const totalWorldCountriesCount = Math.max(1, allNationEntries.length);

      for (let i = 0; i < allNationEntries.length; i++) {
        const partner = allNationEntries[i]!;
        if (partner.id === nation.id || !partner.isAlive) continue;

        const isSevered = NationRelationResolver.isTradeEmbargoed(
          nation,
          partner,
        );
        const rel = nation.relations?.[partner.id];
        const isWar = rel?.stance === "WAR";

        const partnerNavalPower =
          (partner.military.navalFleet || 0) *
          (partner.military.techLevel || 1);

        const isNavalBlockaded = isWar && partnerNavalPower > nationNavalPower;

        if (!isSevered && !isNavalBlockaded) {
          activePartnerCount++;
          const partnerGdp = getNationGdp(partner, provincesMap);
          totalEligibleGdp += partnerGdp;
        }
      }

      const baseTradePool = totalEligibleGdp * 0.01;
      const normalizedTradeVolume =
        baseTradePool * (100 / totalWorldCountriesCount);
      const effectiveTradeVolume = normalizedTradeVolume * seaAccessFactor;
      const maxTradeVolumeCap = nationGdp * 10;
      const cappedTradeVolume = Math.min(
        effectiveTradeVolume,
        maxTradeVolumeCap,
      );

      const tariffRevenue = Math.floor(cappedTradeVolume * (tariffRate / 100));
      const stabilityImpact = Number(((15 - tariffRate) * 0.1).toFixed(2));
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

    const fallbackEligibleGdp = nationGdp * 60;
    const baseTradePool = fallbackEligibleGdp * 0.01;
    const effectiveTradeVolume = baseTradePool * seaAccessFactor;
    const cappedTradeVolume = Math.min(effectiveTradeVolume, nationGdp * 10);
    const tariffRevenue = Math.floor(cappedTradeVolume * (tariffRate / 100));
    const stabilityImpact = Number(((15 - tariffRate) * 0.1).toFixed(2));

    return {
      tariffRevenue,
      stabilityImpact,
      tradeVolumePercentage: 100,
    };
  }
}
