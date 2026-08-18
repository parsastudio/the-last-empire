import { Province } from "@/domain/province/province.schema";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { CountryRegistry } from "@/domain/data/countries";

export interface ProvinceConquestResult {
  updatedProvinces: Record<string, Province>;
  conqueredPixels: number;
  defenderTotalPixels: number;
  remainingDefenderProvinces: Province[];
  attackerProvinces: Province[];
}

export class ProvinceConquestHandler {
  public static handleConquest(
    provinces: Record<string, Province>,
    attackerId: string,
    canonicalAttackerId: string,
    defenderId: string,
    canonicalDefenderId: string,
    isAttackerVictory: boolean,
    isFullCapitulation: boolean,
    targetProvinceId?: number,
    fallbackDefenderPixels: number = 1,
  ): ProvinceConquestResult {
    const updatedProvinces: Record<string, Province> = { ...provinces };

    const cleanAttackerId = CountryRegistry.resolveCanonicalId(attackerId);
    const cleanDefenderId = CountryRegistry.resolveCanonicalId(defenderId);

    const defenderProvincesBefore = Object.values(updatedProvinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === cleanDefenderId,
    );

    const defenderTotalPixels =
      defenderProvincesBefore.reduce((sum, p) => sum + p.pixelCount, 0) ||
      fallbackDefenderPixels;

    let conqueredPixels = 0;

    if (isAttackerVictory) {
      if (isFullCapitulation) {
        for (let i = 0; i < defenderProvincesBefore.length; i++) {
          const prov = defenderProvincesBefore[i]!;
          updatedProvinces[prov.provinceId.toString()] = {
            ...prov,
            ownerNationId: cleanAttackerId,
          };
          conqueredPixels += prov.pixelCount;
        }
        BitPackedGridState.getInstance().markDirty();
      } else {
        let conqueredProvId: number | null = null;
        if (targetProvinceId && updatedProvinces[targetProvinceId.toString()]) {
          conqueredProvId = targetProvinceId;
        } else if (defenderProvincesBefore.length > 0) {
          const sorted = [...defenderProvincesBefore].sort(
            (a, b) => b.pixelCount - a.pixelCount,
          );
          conqueredProvId = sorted[0]!.provinceId;
        }

        if (conqueredProvId) {
          const targetProv = updatedProvinces[conqueredProvId.toString()];
          if (targetProv) {
            updatedProvinces[conqueredProvId.toString()] = {
              ...targetProv,
              ownerNationId: cleanAttackerId,
            };
            conqueredPixels = targetProv.pixelCount;
            BitPackedGridState.getInstance().markDirty();
          }
        }
      }
    }

    const remainingDefenderProvinces = Object.values(updatedProvinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === cleanDefenderId,
    );

    const attackerProvinces = Object.values(updatedProvinces).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === cleanAttackerId,
    );

    return {
      updatedProvinces,
      conqueredPixels,
      defenderTotalPixels,
      remainingDefenderProvinces,
      attackerProvinces,
    };
  }
}
