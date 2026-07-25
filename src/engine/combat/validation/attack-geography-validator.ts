import { Coordinate } from "@/domain/map/coordinate.schema";

export class AttackGeographyValidator {
  public isGeographicallyReachable(
    origin: Coordinate,
    target: Coordinate,
    maxRange = 250,
  ): boolean {
    const distance = Math.hypot(origin.x - target.x, origin.y - target.y);
    return distance <= maxRange;
  }
}
