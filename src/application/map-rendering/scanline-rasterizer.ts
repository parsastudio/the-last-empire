interface Point {
  x: number;
  y: number;
}

export function rasterizePolygon(
  polygon: Point[],
  width: number,
  height: number,
  colorId: number,
  buffer: Uint8Array,
): void {
  if (polygon.length < 3) {
    return;
  }

  let yMin = height - 1;
  let yMax = 0;

  for (let i = 0; i < polygon.length; i++) {
    const py = polygon[i]?.y ?? 0;
    if (py < yMin) yMin = py;
    if (py > yMax) yMax = py;
  }

  yMin = Math.max(0, Math.floor(yMin));
  yMax = Math.min(height - 1, Math.ceil(yMax));

  const intersections: number[] = [];

  for (let y = yMin; y <= yMax; y++) {
    intersections.length = 0;

    for (let i = 0; i < polygon.length; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % polygon.length];

      if (p1 && p2) {
        if ((p1.y < y && p2.y >= y) || (p2.y < y && p1.y >= y)) {
          const x = p1.x + ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y);
          intersections.push(x);
        }
      }
    }

    intersections.sort((a, b) => a - b);

    for (let i = 0; i < intersections.length; i += 2) {
      if (i + 1 >= intersections.length) {
        break;
      }
      const i1 = intersections[i];
      const i2 = intersections[i + 1];
      if (i1 !== undefined && i2 !== undefined) {
        let xStart = Math.ceil(i1);
        let xEnd = Math.floor(i2);

        xStart = Math.max(0, xStart);
        xEnd = Math.min(width - 1, xEnd);

        for (let x = xStart; x <= xEnd; x++) {
          buffer[y * width + x] = colorId;
        }
      }
    }
  }
}
