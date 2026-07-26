import { Coordinate } from "@/domain/map/coordinate.schema";

export class PixelSelectionDetector {
  public detectGridCellCoordinate(
    clientX: number,
    clientY: number,
    rect: DOMRect,
    position: { x: number; y: number },
    scale: number,
    mapWidth: number,
    mapHeight: number,
    scaleFactor = 4,
  ): Coordinate {
    const fx = mapWidth / rect.width;
    const fy = mapHeight / rect.height;

    const mapX = Math.floor(((clientX - rect.left - position.x) / scale) * fx);
    const mapY = Math.floor(((clientY - rect.top - position.y) / scale) * fy);

    return {
      x: Math.floor(Math.max(0, Math.min(mapWidth - 1, mapX)) / scaleFactor),
      y: Math.floor(Math.max(0, Math.min(mapHeight - 1, mapY)) / scaleFactor),
    };
  }
}
