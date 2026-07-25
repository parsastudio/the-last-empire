import { Coordinate } from "@/domain/map/coordinate.schema";

export class CanvasBoundaryClip {
  public clipCoordinates(
    coord: Coordinate,
    width: number,
    height: number,
  ): Coordinate {
    return {
      x: Math.max(0, Math.min(width - 1, coord.x)),
      y: Math.max(0, Math.min(height - 1, coord.y)),
    };
  }
}
