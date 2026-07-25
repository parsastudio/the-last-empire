function clipEdge(
  polygon: [number, number][],
  isInside: (p: [number, number]) => boolean,
  getIntersection: (
    p1: [number, number],
    p2: [number, number],
  ) => [number, number],
): [number, number][] {
  if (polygon.length === 0) return [];
  const result: [number, number][] = [];
  let s = polygon[polygon.length - 1]!;
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i]!;
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

export function clipPolygonToBox(
  polygon: [number, number][],
  box: [number, number, number, number],
): [number, number][] {
  const [xmin, ymin, xmax, ymax] = box;
  let outputList = polygon;

  outputList = clipEdge(
    outputList,
    (p) => p[0] >= xmin,
    (p1, p2) => {
      const t = (xmin - p1[0]) / (p2[0] - p1[0]);
      return [xmin, p1[1] + t * (p2[1] - p1[1])];
    },
  );

  outputList = clipEdge(
    outputList,
    (p) => p[0] <= xmax,
    (p1, p2) => {
      const t = (xmax - p1[0]) / (p2[0] - p1[0]);
      return [xmax, p1[1] + t * (p2[1] - p1[1])];
    },
  );

  outputList = clipEdge(
    outputList,
    (p) => p[1] >= ymin,
    (p1, p2) => {
      const t = (ymin - p1[1]) / (p2[1] - p1[1]);
      return [p1[0] + t * (p2[0] - p1[0]), ymin];
    },
  );

  outputList = clipEdge(
    outputList,
    (p) => p[1] <= ymax,
    (p1, p2) => {
      const t = (ymax - p1[1]) / (p2[1] - p1[1]);
      return [p1[0] + t * (p2[0] - p1[0]), ymax];
    },
  );

  return outputList;
}
