import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { SeaBridgeConnector } from "@/engine/combat/sea-bridges/sea-bridge-connector";

export class SeaBridgeBfs {
  private connector = new SeaBridgeConnector();

  public checkSeaConnectivity(
    p1: Coordinate,
    p2: Coordinate,
    allCells: GridCell[],
    latitude: number,
  ): boolean {
    return this.connector.areConnectedBySeaBridge(p1, p2, latitude);
  }
}
