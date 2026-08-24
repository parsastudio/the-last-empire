import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";

export interface ProvinceConquestResult {
  updatedProvinces: Record<string, Province>;
  conqueredPixels: number;
  remainingDefenderProvinces: Province[];
  conqueredProvincesList: Province[];
}

export class ProvinceConquestHandler {
  public static handleConquest(
    provinces: Record<string, Province>,
    attackerId: string,
    defenderId: string,
    isAttackerVictory: boolean,
    isFullCapitulation: boolean,
    targetProvinceId?: number,
  ): ProvinceConquestResult {
    const updatedProvinces: Record<string, Province> = { ...provinces };

    const cleanAttackerId = CountryRegistry.resolveCanonicalId(attackerId);
    const cleanDefenderId = CountryRegistry.resolveCanonicalId(defenderId);

    const defenderProvincesBefore = Object.values(updatedProvinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === cleanDefenderId,
    );

    let conqueredPixels = 0;
    const conqueredProvincesList: Province[] = [];

    if (isAttackerVictory) {
      if (isFullCapitulation) {
        for (let i = 0; i < defenderProvincesBefore.length; i++) {
          const prov = defenderProvincesBefore[i]!;
          const conqueredProv: Province = {
            ...prov,
            ownerNationId: cleanAttackerId,
          };
          updatedProvinces[prov.provinceId.toString()] = conqueredProv;
          conqueredPixels += prov.pixelCount;
          conqueredProvincesList.push(conqueredProv);
        }
      } else {
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

        if (!conqueredProvId && defenderProvincesBefore.length > 0) {
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
            const conqueredProv: Province = {
              ...targetProv,
              ownerNationId: cleanAttackerId,
            };
            updatedProvinces[conqueredProvId.toString()] = conqueredProv;
            conqueredPixels = targetProv.pixelCount;
            conqueredProvincesList.push(conqueredProv);
          }
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
    };
  }
}
