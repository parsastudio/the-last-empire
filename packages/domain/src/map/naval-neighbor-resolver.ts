import { CountryRegistry } from "@/domain/data/countries";
import { Province } from "@/domain/province/province.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export interface NavalAttackInfo {
  isNavalValid: boolean;
  closestDistance: number;
  closestProvinceName: string;
  navalCostMultiplier: number;
  deploymentMoneyCost: number;
}

export class NavalNeighborResolver {
  private static readonly MAP_WIDTH = 4096;

  public static resolveNavalAttack(
    targetProvinceId: number | null,
    attackerNationId: string,
    provincesMap: Record<string, Province> | undefined,
    infantryCount: number,
    armorCount: number,
    airForceCount: number,
    droneCount: number,
    attackerProvinces?: Province[],
  ): NavalAttackInfo {
    if (!provincesMap || !targetProvinceId) {
      return {
        isNavalValid: false,
        closestDistance: 0,
        closestProvinceName: "",
        navalCostMultiplier: 0,
        deploymentMoneyCost: 0,
      };
    }

    const targetProv = provincesMap[targetProvinceId.toString()];
    if (!targetProv || !targetProv.hasSeaAccess) {
      return {
        isNavalValid: false,
        closestDistance: 0,
        closestProvinceName: "",
        navalCostMultiplier: 0,
        deploymentMoneyCost: 0,
      };
    }

    const canonicalAttacker =
      CountryRegistry.resolveCanonicalId(attackerNationId);

    const coastalProvinces: Province[] = [];

    if (attackerProvinces) {
      for (let i = 0; i < attackerProvinces.length; i++) {
        const p = attackerProvinces[i]!;
        if (p.hasSeaAccess) {
          coastalProvinces.push(p);
        }
      }
    } else {
      for (const key in provincesMap) {
        const p = provincesMap[key]!;
        if (
          CountryRegistry.resolveCanonicalId(p.ownerNationId) ===
            canonicalAttacker &&
          p.hasSeaAccess
        ) {
          coastalProvinces.push(p);
        }
      }
    }

    if (coastalProvinces.length === 0) {
      return {
        isNavalValid: false,
        closestDistance: 0,
        closestProvinceName: "",
        navalCostMultiplier: 0,
        deploymentMoneyCost: 0,
      };
    }

    let minDistance = Infinity;
    let closestProv = coastalProvinces[0]!;

    const targetX = targetProv.centerCoordinates.x;
    const targetY = targetProv.centerCoordinates.y;

    for (let i = 0; i < coastalProvinces.length; i++) {
      const prov = coastalProvinces[i]!;
      const srcX = prov.centerCoordinates.x;
      const srcY = prov.centerCoordinates.y;

      const rawDx = Math.abs(srcX - targetX);
      const deltaX = Math.min(rawDx, this.MAP_WIDTH - rawDx);
      const deltaY = Math.abs(srcY - targetY);
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (dist < minDistance) {
        minDistance = dist;
        closestProv = prov;
      }
    }

    const distanceFactor = Math.min(1.0, minDistance / 4000);
    const navalCostMultiplier = 0.1 + 0.9 * distanceFactor;

    const totalForceCost =
      infantryCount * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      armorCount * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      airForceCount * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      droneCount * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost;

    const deploymentMoneyCost = Math.floor(
      totalForceCost * navalCostMultiplier,
    );

    return {
      isNavalValid: true,
      closestDistance: Math.round(minDistance),
      closestProvinceName: closestProv.nameFa,
      navalCostMultiplier,
      deploymentMoneyCost,
    };
  }
}
