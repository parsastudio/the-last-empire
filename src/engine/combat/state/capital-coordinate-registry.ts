import { Coordinate } from "@/domain/map/coordinate.schema";

export class CapitalCoordinateRegistry {
  private capitals = new Map<string, Coordinate>();

  public registerCapital(countryId: string, coord: Coordinate): void {
    this.capitals.set(countryId, coord);
  }

  public getCapitalCoordinate(countryId: string): Coordinate | undefined {
    return this.capitals.get(countryId);
  }

  public clear(): void {
    this.capitals.clear();
  }
}
