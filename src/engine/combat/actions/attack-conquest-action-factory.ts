import { AttackAction } from "@/domain/game/action.schema";
import { Coordinate } from "@/domain/map/coordinate.schema";

export class AttackConquestActionFactory {
  public createAttackConquest(
    attackerId: string,
    targetId: string,
    target: Coordinate,
  ): AttackAction {
    const actionId = `attack-conquest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: actionId,
      nationId: attackerId,
      type: "ATTACK",
      targetNationId: targetId,
      infantry: target.x,
      airForce: target.y,
      droneMissile: 0,
    };
  }
}
