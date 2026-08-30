import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { ProvinceDegradationUtility } from "@geopolitics/domain";

export interface ProvinceConquestResult {
  updatedProvinces: Record<string, Province>;
  conqueredPixels: number;
  remainingDefenderProvinces: Province[];
  conqueredProvincesList: Province[];
  totalDefenderGdpBefore: number;
  conqueredProvincesGdp: number;
}

export class ProvinceConquestHandler {
  public static handleConquest(
    provinces: Record<string, Province>,
    attackerId: string,
    defenderId: string,
    isAttackerVictory: boolean,
    targetProvinceId?: number,
  ): ProvinceConquestResult {
    const updatedProvinces: Record<string, Province> = { ...provinces };

    const cleanAttackerId = CountryRegistry.resolveCanonicalId(attackerId);
    const cleanDefenderId = CountryRegistry.resolveCanonicalId(defenderId);

    const defenderProvincesBefore = Object.values(updatedProvinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === cleanDefenderId,
    );

    let totalDefenderGdpBefore = 0;
    for (let i = 0; i < defenderProvincesBefore.length; i++) {
      totalDefenderGdpBefore += getProvinceGdp(defenderProvincesBefore[i]!);
    }

    let conqueredPixels = 0;
    let conqueredProvincesGdp = 0;
    const conqueredProvincesList: Province[] = [];

    if (isAttackerVictory && defenderProvincesBefore.length > 0) {
      let conqueredProvId: number | null = null;

      if (targetProvinceId && updatedProvinces[targetProvinceId.toString()]) {
        const targetedProv = updatedProvinces[targetProvinceId.toString()]!;
        const actualOwner = CountryRegistry.resolveCanonicalId(
          targetedProv.ownerNationId,
        );
        if (actualOwner === cleanDefenderId) {
          conqueredProvId = targetProvinceId;
        }
      }

      if (!conqueredProvId) {
        const sorted = [...defenderProvincesBefore].sort(
          (a, b) => b.pixelCount - a.pixelCount,
        );
        conqueredProvId = sorted[0]!.provinceId;
      }

      if (conqueredProvId) {
        const targetProv = updatedProvinces[conqueredProvId.toString()];
        if (
          targetProv &&
          CountryRegistry.resolveCanonicalId(targetProv.ownerNationId) ===
            cleanDefenderId
        ) {
          const { population, perCapitaProductivity } =
            ProvinceDegradationUtility.applyConquestDegradation(targetProv);

          const conqueredProv: Province = {
            ...targetProv,
            ownerNationId: cleanAttackerId,
            population,
            perCapitaProductivity,
          };
          updatedProvinces[conqueredProvId.toString()] = conqueredProv;
          conqueredPixels = targetProv.pixelCount;
          conqueredProvincesGdp = getProvinceGdp(targetProv);
          conqueredProvincesList.push(conqueredProv);
        }
      }
    }

    const remainingDefenderProvinces = Object.values(updatedProvinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === cleanDefenderId,
    );

    return {
      updatedProvinces,
      conqueredPixels,
      remainingDefenderProvinces,
      conqueredProvincesList,
      totalDefenderGdpBefore,
      conqueredProvincesGdp,
    };
  }
}
