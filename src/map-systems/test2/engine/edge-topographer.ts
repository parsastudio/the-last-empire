import { SubdividedRegion } from "./types";
import { classifyCoastalRegion } from "./coastal-classifier";
import { CountryData } from "./border-classifier";

export function buildNeighborTopology(
  regions: SubdividedRegion[],
  countries: CountryData[],
): void {
  const edgeMap = new Map<string, string[]>();

  regions.forEach((region) => {
    region.polygons.forEach((poly) => {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        if (!p1 || !p2) continue;

        const x1 = Math.round(p1[0] * 10000);
        const y1 = Math.round(p1[1] * 10000);
        const x2 = Math.round(p2[0] * 10000);
        const y2 = Math.round(p2[1] * 10000);

        const key1 = `${x1},${y1}`;
        const key2 = `${x2},${y2}`;
        const edgeKey = key1 < key2 ? `${key1}#${key2}` : `${key2}#${key1}`;

        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, []);
        }
        const list = edgeMap.get(edgeKey)!;
        if (!list.includes(region.id)) {
          list.push(region.id);
        }
      }
    });
  });

  edgeMap.forEach((regionsList, edgeKey) => {
    if (regionsList.length > 1) {
      for (let i = 0; i < regionsList.length; i++) {
        for (let j = i + 1; j < regionsList.length; j++) {
          const r1 = regionsList[i];
          const r2 = regionsList[j];
          const reg1 = regions.find((r) => r.id === r1);
          const reg2 = regions.find((r) => r.id === r2);
          if (reg1 && reg2) {
            if (!reg1.neighbors.includes(reg2.id)) reg1.neighbors.push(reg2.id);
            if (!reg2.neighbors.includes(reg1.id)) reg2.neighbors.push(reg1.id);
          }
        }
      }
    } else {
      const regId = regionsList[0];
      const reg = regions.find((r) => r.id === regId);
      if (reg) {
        const parts = edgeKey.split("#");
        if (parts[0] && parts[1]) {
          const c1 = parts[0].split(",");
          const c2 = parts[1].split(",");
          const p1: [number, number] = [
            Number(c1[0]) / 10000,
            Number(c1[1]) / 10000,
          ];
          const p2: [number, number] = [
            Number(c2[0]) / 10000,
            Number(c2[1]) / 10000,
          ];
          const mid: [number, number] = [
            (p1[0] + p2[0]) / 2,
            (p1[1] + p2[1]) / 2,
          ];

          const country = countries.find((c) => c.code === reg.countryCode);
          if (country) {
            const matchesCoast = classifyCoastalRegion(
              mid,
              reg.countryCode,
              country.originalCoastalEdges,
            );
            if (matchesCoast) {
              reg.isCoastal = true;
            }
          }
        }
      }
    }
  });
}
