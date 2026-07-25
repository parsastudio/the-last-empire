import { getBoundingBox, calculatePolygonArea } from "./geometry-utils";
import { clipPolygonToBox } from "./polygon-clipper";
import type { GridBox } from "./types";

export function subdivideSinglePolygon(
  polygon: [number, number][],
  targetN: number,
): [number, number][][] {
  if (targetN <= 1) {
    return [polygon];
  }

  const initialBox = getBoundingBox([polygon]);
  const initialArea = calculatePolygonArea(polygon);
  const activeBoxes: GridBox[] = [
    { box: initialBox, clippedPolygons: [polygon], area: initialArea },
  ];

  while (activeBoxes.length < targetN) {
    let bestIdx = -1;
    let maxArea = -1;
    for (let i = 0; i < activeBoxes.length; i++) {
      const item = activeBoxes[i];
      if (item && item.area > maxArea) {
        maxArea = item.area;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) {
      break;
    }

    const targetBox = activeBoxes[bestIdx];
    if (!targetBox) {
      break;
    }
    activeBoxes.splice(bestIdx, 1);

    const [xmin, ymin, xmax, ymax] = targetBox.box;
    const w = xmax - xmin;
    const h = ymax - ymin;

    let box1: [number, number, number, number];
    let box2: [number, number, number, number];

    if (w > h) {
      const xmid = (xmin + xmax) / 2;
      box1 = [xmin, ymin, xmid, ymax];
      box2 = [xmid, ymin, xmax, ymax];
    } else {
      const ymid = (ymin + ymax) / 2;
      box1 = [xmin, ymin, xmax, ymid];
      box2 = [xmin, ymid, xmax, ymax];
    }

    const polys1: [number, number][][] = [];
    let area1 = 0;
    const polys2: [number, number][][] = [];
    let area2 = 0;

    for (const poly of targetBox.clippedPolygons) {
      const clip1 = clipPolygonToBox(poly, box1);
      if (clip1.length >= 3) {
        const a1 = calculatePolygonArea(clip1);
        if (a1 > 1e-6) {
          polys1.push(clip1);
          area1 += a1;
        }
      }

      const clip2 = clipPolygonToBox(poly, box2);
      if (clip2.length >= 3) {
        const a2 = calculatePolygonArea(clip2);
        if (a2 > 1e-6) {
          polys2.push(clip2);
          area2 += a2;
        }
      }
    }

    if (polys1.length > 0) {
      activeBoxes.push({ box: box1, clippedPolygons: polys1, area: area1 });
    }
    if (polys2.length > 0) {
      activeBoxes.push({ box: box2, clippedPolygons: polys2, area: area2 });
    }
  }

  return activeBoxes.flatMap((b) => b.clippedPolygons);
}
