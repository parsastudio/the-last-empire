export interface Point {
  x: number;
  y: number;
}

export function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][],
): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

export function getPolygonBoundingBox(
  polygon: [number, number][],
): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const pt of polygon) {
    if (pt[0] < minX) minX = pt[0];
    if (pt[1] < minY) minY = pt[1];
    if (pt[0] > maxX) maxX = pt[0];
    if (pt[1] > maxY) maxY = pt[1];
  }
  return [minX, minY, maxX, maxY];
}

export function clipPolygonWithHalfPlane(
  poly: [number, number][],
  A: number,
  B: number,
  C: number,
): [number, number][] {
  const result: [number, number][] = [];
  if (poly.length === 0) {
    return [];
  }

  const isInside = (p: [number, number]) => A * p[0] + B * p[1] + C >= 0;

  const getIntersection = (
    p1: [number, number],
    p2: [number, number],
  ): [number, number] => {
    const denom = A * (p2[0] - p1[0]) + B * (p2[1] - p1[1]);
    if (Math.abs(denom) < 1e-9) {
      return p1;
    }
    const t = -(A * p1[0] + B * p1[1] + C) / denom;
    return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
  };

  let s = poly[poly.length - 1];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    if (isInside(p)) {
      if (isInside(s)) {
        result.push(p);
      } else {
        result.push(getIntersection(s, p));
        result.push(p);
      }
    } else if (isInside(s)) {
      result.push(getIntersection(s, p));
    }
    s = p;
  }
  return result;
}

export function generateOrganicSeeds(
  polygon: [number, number][],
  targetCount: number,
): [number, number][] {
  const seeds: [number, number][] = [];
  const [xmin, ymin, xmax, ymax] = getPolygonBoundingBox(polygon);
  const steps = Math.ceil(Math.sqrt(targetCount * 3));
  const dx = (xmax - xmin) / steps;
  const dy = (ymax - ymin) / steps;

  for (let i = 1; i < steps; i++) {
    for (let j = 1; j < steps; j++) {
      const cx = xmin + i * dx;
      const cy = ymin + j * dy;
      if (isPointInPolygon([cx, cy], polygon)) {
        seeds.push([cx, cy]);
      }
    }
  }

  if (seeds.length === 0) {
    let sumX = 0;
    let sumY = 0;
    polygon.forEach((pt) => {
      sumX += pt[0];
      sumY += pt[1];
    });
    return [[sumX / polygon.length, sumY / polygon.length]];
  }

  while (seeds.length > targetCount) {
    seeds.splice(Math.floor(Math.random() * seeds.length), 1);
  }

  return seeds;
}

export function partitionPolygonToVoronoiCells(
  polygon: [number, number][],
  seeds: [number, number][],
): [number, number][][] {
  if (seeds.length <= 1) {
    return [polygon];
  }

  const cells: [number, number][][] = [];

  for (let i = 0; i < seeds.length; i++) {
    const P = seeds[i];
    let cellPoly = [...polygon];

    for (let j = 0; j < seeds.length; j++) {
      if (i === j) continue;
      const Q = seeds[j];

      const Mx = (P[0] + Q[0]) / 2;
      const My = (P[1] + Q[1]) / 2;

      const A = P[0] - Q[0];
      const B = P[1] - Q[1];
      const C = -Mx * (P[0] - Q[0]) - My * (P[1] - Q[1]);

      cellPoly = clipPolygonWithHalfPlane(cellPoly, A, B, C);
    }

    if (cellPoly.length >= 3) {
      cells.push(cellPoly);
    }
  }

  return cells;
}
