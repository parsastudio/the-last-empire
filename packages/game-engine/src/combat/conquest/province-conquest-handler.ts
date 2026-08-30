import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import {
  getProvinceGdp,
  getNationGdp,
} from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";

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
          const survivingFactories = Math.floor(
            targetProv.factoriesCount * 0.8,
          );

          const conqueredProv: Province = {
            ...targetProv,
            ownerNationId: cleanAttackerId,
            factoriesCount: survivingFactories,
          };
          updatedProvinces[conqueredProvId.toString()] = conqueredProv;
          conqueredPixels = targetProv.pixelCount;
          conqueredProvincesGdp = getProvinceGdp(targetProv);
          conqueredProvincesList.push(conqueredProv);
        }
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
    };
  }
}
