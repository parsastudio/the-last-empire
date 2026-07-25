import { Coordinate } from "@/domain/map/coordinate.schema";

export class DistanceCalculator {
  public getEuclideanDistance(p1: Coordinate, p2: Coordinate): number {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  public getManhattanDistance(p1: Coordinate, p2: Coordinate): number {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  }
}
