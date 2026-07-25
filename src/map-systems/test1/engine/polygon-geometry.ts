export interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function getBoundingBox(polygons: [number, number][][]): Box {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const poly of polygons) {
    for (const pt of poly) {
      if (pt[0] < minX) minX = pt[0];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] < minY) minY = pt[1];
      if (pt[1] > maxY) maxY = pt[1];
    }
  }
  return { minX, maxX, minY, maxY };
}

export function isPointInPolygon(
  point: [number, number],
  vs: [number, number][],
): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isPointInCountry(
  point: [number, number],
  polygons: [number, number][][],
): boolean {
  return polygons.some((poly) => isPointInPolygon(point, poly));
}

export function calculateRingArea(ring: [number, number][]): number {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];
    if (p1 && p2) {
      area += p1[0] * p2[1] - p2[0] * p1[1];
    }
  }
  return Math.abs(area) / 2;
}

export function snapCoord(val: number): number {
  return Math.round(val * 1000) / 1000;
}
