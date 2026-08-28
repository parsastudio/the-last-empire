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
    _isFullCapitulation = false,
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
          const nextPopulation = Math.max(
            10,
            Math.floor(targetProv.population * 0.75),
          );
          const nextProductivity = Math.max(
            100,
            Math.floor((targetProv.perCapitaProductivity || 5000) * 0.75),
          );

          const conqueredProv: Province = {
            ...targetProv,
            ownerNationId: cleanAttackerId,
            population: nextPopulation,
            perCapitaProductivity: nextProductivity,
          };
          updatedProvinces[conqueredProvId.toString()] = conqueredProv;
          conqueredPixels = targetProv.pixelCount;
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
    };
  }
}
