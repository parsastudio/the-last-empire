import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import {
  getProvinceGdp,
  getNationGdp,
} from "@/domain/nation/gdp-calculator.utility";
import {
  NationGettersUtility,
  IndustryCalculator,
  MapTopologyRegistry,
} from "@geopolitics/domain";

export interface ProvinceConquestResult {
  updatedProvinces: Record<string, ProvinceDynamicState>;
  conqueredPixels: number;
  remainingDefenderProvinces: ProvinceDynamicState[];
  conqueredProvincesList: ProvinceDynamicState[];
  totalDefenderGdpBefore: number;
  conqueredProvincesGdp: number;
  conqueredFactoriesCount: number;
  originalFactoriesCount: number;
}

export class ProvinceConquestHandler {
  public static handleConquest(
    provinces: Record<string, ProvinceDynamicState>,
    attackerId: string,
    defenderId: string,
    isAttackerVictory: boolean,
    targetProvinceId?: number,
    attackerIndustrialLevel?: number,
    maxProvincesToConquer = 1,
  ): ProvinceConquestResult {
    const updatedProvinces: Record<string, ProvinceDynamicState> = {
      ...provinces,
    };

    const cleanAttackerId = CountryRegistry.resolveCanonicalId(attackerId);
    const cleanDefenderId = CountryRegistry.resolveCanonicalId(defenderId);

    const defenderProvincesBefore = NationGettersUtility.getOwnedProvinces(
      cleanDefenderId,
      updatedProvinces,
    );
    const totalDefenderGdpBefore = getNationGdp(
      cleanDefenderId,
      updatedProvinces,
      defenderProvincesBefore,
    );

    let conqueredPixels = 0;
    let conqueredProvincesGdp = 0;
    let conqueredFactoriesCount = 0;
    let originalFactoriesCount = 0;
    const conqueredProvincesList: ProvinceDynamicState[] = [];

    if (isAttackerVictory && defenderProvincesBefore.length > 0) {
      let primaryProvince: ProvinceDynamicState | null = null;

      if (targetProvinceId && updatedProvinces[targetProvinceId.toString()]) {
        const targetedProv = updatedProvinces[targetProvinceId.toString()]!;
        const actualOwner = CountryRegistry.resolveCanonicalId(
          targetedProv.ownerNationId,
        );
        if (actualOwner === cleanDefenderId) {
          primaryProvince = targetedProv;
        }
      }

      const restProvinces = defenderProvincesBefore.filter(
        (p) => !primaryProvince || p.provinceId !== primaryProvince.provinceId,
      );

      restProvinces.sort((a, b) => {
        const gdpA = getProvinceGdp(a);
        const gdpB = getProvinceGdp(b);
        if (gdpB !== gdpA) return gdpB - gdpA;
        return (
          MapTopologyRegistry.getPixelCount(b.provinceId) -
          MapTopologyRegistry.getPixelCount(a.provinceId)
        );
      });

      const candidateList = primaryProvince
        ? [primaryProvince, ...restProvinces]
        : restProvinces;

      const provincesToTake = candidateList.slice(
        0,
        Math.max(1, maxProvincesToConquer),
      );

      for (let i = 0; i < provincesToTake.length; i++) {
        const targetProv = provincesToTake[i]!;
        originalFactoriesCount += targetProv.factoriesCount;
        const survivingFactories = Math.floor(targetProv.factoriesCount * 0.8);
        conqueredFactoriesCount += survivingFactories;

        const remainingTiers = targetProv.factoryTiers
          ? targetProv.factoryTiers.map((t) => ({
              ...t,
              count: Math.floor(t.count * 0.8),
            }))
          : [];

        const flooredTiers =
          attackerIndustrialLevel !== undefined
            ? IndustryCalculator.applyIndustrialFloor(
                remainingTiers,
                attackerIndustrialLevel,
              )
            : remainingTiers;

        const conqueredProv: ProvinceDynamicState = {
          ...targetProv,
          ownerNationId: cleanAttackerId,
          factoriesCount: survivingFactories,
          factoryTiers: flooredTiers,
        };

        updatedProvinces[targetProv.provinceId.toString()] = conqueredProv;
        conqueredPixels += MapTopologyRegistry.getPixelCount(
          targetProv.provinceId,
        );
        conqueredProvincesGdp += getProvinceGdp(conqueredProv);
        conqueredProvincesList.push(conqueredProv);
      }
    }

    const remainingDefenderProvinces = NationGettersUtility.getOwnedProvinces(
      cleanDefenderId,
      updatedProvinces,
    );

    return {
      updatedProvinces,
      conqueredPixels,
      remainingDefenderProvinces,
      conqueredProvincesList,
      totalDefenderGdpBefore,
      conqueredProvincesGdp,
      conqueredFactoriesCount,
      originalFactoriesCount,
    };
  }
}
