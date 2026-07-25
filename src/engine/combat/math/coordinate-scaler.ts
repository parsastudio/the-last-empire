import { Coordinate } from "@/domain/map/coordinate.schema";

export class CoordinateScaler {
  private readonly scaleFactor: number;

  constructor(scaleFactor = 4) {
    this.scaleFactor = scaleFactor;
  }

  public scaleDown(highRes: Coordinate): Coordinate {
    return {
      x: Math.floor(highRes.x / this.scaleFactor),
      y: Math.floor(highRes.y / this.scaleFactor),
    };
  }

  public scaleUp(lowRes: Coordinate): Coordinate {
    return {
      x: lowRes.x * this.scaleFactor,
      y: lowRes.y * this.scaleFactor,
    };
  }
}
