export interface Coordinate {
  x: number;
  y: number;
}

export class EquirectangularProjection {
  public project(
    longitude: number,
    latitude: number,
    width: number,
    height: number,
  ): Coordinate {
    const x = ((longitude + 180) / 360) * width;
    const y = ((90 - latitude) / 180) * height;
    return { x, y };
  }
}
