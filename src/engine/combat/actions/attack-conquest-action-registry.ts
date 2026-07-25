import { ActionRouter } from "@/engine/actions/action-router";
import { AttackConquestHandler } from "@/engine/combat/actions/attack-conquest-handler";

export class AttackConquestActionRegistry {
  public registerAttackHandler(router: ActionRouter): void {
    router.register("ATTACK", new AttackConquestHandler());
  }
}
