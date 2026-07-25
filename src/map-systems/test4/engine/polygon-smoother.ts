export function smoothPolygonChaikin(
  poly: [number, number][],
  iterations = 3,
): [number, number][] {
  if (poly.length < 3) {
    return poly;
  }
  let current = [...poly];

  for (let iter = 0; iter < iterations; iter++) {
    const next: [number, number][] = [];
    for (let i = 0; i < current.length; i++) {
      const p1 = current[i];
      const p2 = current[(i + 1) % current.length];
      if (p1 && p2) {
        const q: [number, number] = [
          0.75 * p1[0] + 0.25 * p2[0],
          0.75 * p1[1] + 0.25 * p2[1],
        ];
        const r: [number, number] = [
          0.25 * p1[0] + 0.75 * p2[0],
          0.25 * p1[1] + 0.75 * p2[1],
        ];
        next.push(q);
        next.push(r);
      }
    }
    current = next;
  }

  return current;
}
