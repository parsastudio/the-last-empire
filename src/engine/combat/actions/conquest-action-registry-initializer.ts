import { ActionRouter } from "@/engine/actions/action-router";
import { AttackConquestHandler } from "@/engine/combat/actions/attack-conquest-handler";

export class ConquestActionRegistryInitializer {
  public registerHandlers(router: ActionRouter): void {
    router.register("ATTACK", new AttackConquestHandler());
  }
}
