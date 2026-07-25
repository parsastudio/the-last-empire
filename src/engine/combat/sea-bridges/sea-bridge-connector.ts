import { Coordinate } from "@/domain/map/coordinate.schema";

export class SeaBridgeConnector {
  private readonly maxBridgeDistanceKm = 100;
  private readonly kmPerPixelAtEquator = 60.8;

  public areConnectedBySeaBridge(
    p1: Coordinate,
    p2: Coordinate,
    latitude: number,
  ): boolean {
    const radians = (latitude * Math.PI) / 180;
    const kmPerPixel = this.kmPerPixelAtEquator * Math.cos(radians);
    const pixelDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    const actualDistanceKm = pixelDistance * kmPerPixel;
    return actualDistanceKm <= this.maxBridgeDistanceKm;
  }
}
