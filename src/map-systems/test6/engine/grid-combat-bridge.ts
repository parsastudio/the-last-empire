import { Coordinate } from "@/domain/map/coordinate.schema";
import { CoordinateScaler } from "@/engine/combat/math/coordinate-scaler";

export class GridCombatBridge {
  private scaler = new CoordinateScaler(4);

  public mapHighResToGridCell(highRes: Coordinate): Coordinate {
    return this.scaler.scaleDown(highRes);
  }

  public mapGridCellToHighRes(lowRes: Coordinate): Coordinate {
    return this.scaler.scaleUp(lowRes);
  }
}
