export function calculatePolygonArea(polygon: [number, number][]): number {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const p1 = polygon[i];
    const p2 = polygon[j];
    if (p1 && p2) {
      area += p1[0] * p2[1] - p2[0] * p1[1];
    }
  }
  return Math.abs(area) / 2;
}

export function getBoundingBox(
  polygons: [number, number][][],
): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const poly of polygons) {
    for (const pt of poly) {
      if (pt[0] < minX) minX = pt[0];
      if (pt[1] < minY) minY = pt[1];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] > maxY) maxY = pt[1];
    }
  }
  return [minX, minY, maxX, maxY];
}

export function getDistance(
  p1: [number, number],
  p2: [number, number],
): number {
  return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
}

export function getPointToSegmentDistance(
  p: [number, number],
  s1: [number, number],
  s2: [number, number],
): number {
  const dx = s2[0] - s1[0];
  const dy = s2[1] - s1[1];
  if (dx === 0 && dy === 0) {
    return Math.hypot(p[0] - s1[0], p[1] - s1[1]);
  }
  const t = ((p[0] - s1[0]) * dx + (p[1] - s1[1]) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));
  const projX = s1[0] + clampedT * dx;
  const projY = s1[1] + clampedT * dy;
  return Math.hypot(p[0] - projX, p[1] - projY);
}
