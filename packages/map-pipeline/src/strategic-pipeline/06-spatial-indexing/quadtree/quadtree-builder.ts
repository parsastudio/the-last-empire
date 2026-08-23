import { QuadtreeNode } from "@/infrastructure/strategic-pipeline/06-spatial-indexing/quadtree/quadtree-types";

export class QuadtreeBuilder {
  public static buildHemisphereTree(
    data: Uint16Array,
    mapWidth: number,
    mapHeight: number,
    offsetX: number,
    offsetY: number,
    size: number,
  ): QuadtreeNode {
    return this.buildRecursive(
      data,
      mapWidth,
      mapHeight,
      offsetX,
      offsetY,
      size,
    );
  }

  private static buildRecursive(
    data: Uint16Array,
    mapWidth: number,
    mapHeight: number,
    x: number,
    y: number,
    size: number,
  ): QuadtreeNode {
    if (size === 1) {
      const pid = this.samplePixel(data, mapWidth, mapHeight, x, y);
      return {
        isLeaf: true,
        provinceId: pid,
      };
    }

    const half = size >> 1;

    const childTL = this.buildRecursive(data, mapWidth, mapHeight, x, y, half);
    const childTR = this.buildRecursive(
      data,
      mapWidth,
      mapHeight,
      x + half,
      y,
      half,
    );
    const childBL = this.buildRecursive(
      data,
      mapWidth,
      mapHeight,
      x,
      y + half,
      half,
    );
    const childBR = this.buildRecursive(
      data,
      mapWidth,
      mapHeight,
      x + half,
      y + half,
      half,
    );

    if (
      childTL.isLeaf &&
      childTR.isLeaf &&
      childBL.isLeaf &&
      childBR.isLeaf &&
      childTL.provinceId === childTR.provinceId &&
      childTL.provinceId === childBL.provinceId &&
      childTL.provinceId === childBR.provinceId
    ) {
      return {
        isLeaf: true,
        provinceId: childTL.provinceId,
      };
    }

    return {
      isLeaf: false,
      children: [childTL, childTR, childBL, childBR],
    };
  }

  private static samplePixel(
    data: Uint16Array,
    mapWidth: number,
    mapHeight: number,
    x: number,
    y: number,
  ): number {
    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
      return 0;
    }
    return data[y * mapWidth + x]! & 0x0fff;
  }
}
