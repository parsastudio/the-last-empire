import {
  ProvinceDynamicState,
  CountryRegistry,
  MapTopologyRegistry,
} from "@geopolitics/domain";

export interface MainlandClusterGeometry {
  centerX: number;
  centerY: number;
  effectiveDiameter: number;
  totalPixels: number;
}

export class MainlandClusterResolver {
  public static resolveGeometry(
    nationId: string,
    provincesMap?: Record<string, ProvinceDynamicState>,
  ): MainlandClusterGeometry | null {
    if (!provincesMap) return null;

    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    const ownedProvinces = Object.values(provincesMap).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId,
    );

    if (ownedProvinces.length === 0) return null;

    const provinceLookup = new Map<number, ProvinceDynamicState>();
    for (const p of ownedProvinces) {
      provinceLookup.set(p.provinceId, p);
    }

    const visited = new Set<number>();
    const clusters: ProvinceDynamicState[][] = [];

    for (const p of ownedProvinces) {
      if (visited.has(p.provinceId)) continue;

      const cluster: ProvinceDynamicState[] = [];
      const queue: number[] = [p.provinceId];
      visited.add(p.provinceId);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentProv = provinceLookup.get(currentId);
        if (!currentProv) continue;

        cluster.push(currentProv);

        const neighbors = MapTopologyRegistry.getLandNeighbors(
          currentProv.provinceId,
        );
        for (const neighborId of neighbors) {
          if (provinceLookup.has(neighborId) && !visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }

      clusters.push(cluster);
    }

    clusters.sort((a, b) => {
      const pixelsA = a.reduce(
        (sum, item) =>
          sum + MapTopologyRegistry.getPixelCount(item.provinceId, 1),
        0,
      );
      const pixelsB = b.reduce(
        (sum, item) =>
          sum + MapTopologyRegistry.getPixelCount(item.provinceId, 1),
        0,
      );
      return pixelsB - pixelsA;
    });

    const mainCluster = clusters[0] ?? ownedProvinces;

    let totalWeight = 0;
    let weightedSumX = 0;
    let weightedSumY = 0;

    for (const p of mainCluster) {
      const weight = Math.max(
        1,
        MapTopologyRegistry.getPixelCount(p.provinceId, 1),
      );
      const center = MapTopologyRegistry.getCenterCoordinates(p.provinceId);
      weightedSumX += center.x * weight;
      weightedSumY += center.y * weight;
      totalWeight += weight;
    }

    const rawCenterX = totalWeight > 0 ? weightedSumX / totalWeight : 2048;
    const rawCenterY = totalWeight > 0 ? weightedSumY / totalWeight : 1024;

    let closestProvince = mainCluster[0]!;
    let minDistanceSq = Infinity;

    for (const p of mainCluster) {
      const center = MapTopologyRegistry.getCenterCoordinates(p.provinceId);
      const dx = center.x - rawCenterX;
      const dy = center.y - rawCenterY;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closestProvince = p;
      }
    }

    const closestCenter = MapTopologyRegistry.getCenterCoordinates(
      closestProvince.provinceId,
    );
    const isInsideReasonableDistance = minDistanceSq < 25000;
    const centerX = isInsideReasonableDistance ? rawCenterX : closestCenter.x;
    const centerY = isInsideReasonableDistance ? rawCenterY : closestCenter.y;

    const clusterRadius = Math.sqrt(totalWeight / Math.PI);
    const effectiveDiameter = Math.max(
      18,
      Math.min(180, Math.round(clusterRadius * 0.85)),
    );

    return {
      centerX,
      centerY,
      effectiveDiameter,
      totalPixels: totalWeight,
    };
  }
}
