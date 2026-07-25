import { Coordinate } from "@/domain/map/coordinate.schema";
import { SeaBridgeConnector } from "@/engine/combat/sea-bridges/sea-bridge-connector";

export function runSeaBridgeConnectorTest(): boolean {
  const connector = new SeaBridgeConnector();

  const p1: Coordinate = { x: 500, y: 150 };
  const p2: Coordinate = { x: 501, y: 150 };

  const success = connector.areConnectedBySeaBridge(p1, p2, 25);
  return success;
}
