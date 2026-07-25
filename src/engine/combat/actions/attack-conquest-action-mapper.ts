import { AttackAction } from "@/domain/game/action.schema";
import { Coordinate } from "@/domain/map/coordinate.schema";

export class AttackConquestActionMapper {
  public mapActionToCoordinate(action: AttackAction): Coordinate {
    return {
      x: Math.floor(action.infantry % 1024),
      y: Math.floor(action.airForce % 512),
    };
  }
}
