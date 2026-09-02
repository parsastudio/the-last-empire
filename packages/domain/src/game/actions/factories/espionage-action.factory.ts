import { ExecuteEspionageAction } from "@/domain/game/actions/schemas/espionage-action.schema";
import { EspionageTier } from "@/domain/espionage/espionage.schema";

export class EspionageActionFactory {
  private static createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  public static executeEspionage(
    nationId: string,
    targetNationId: string,
    tier: EspionageTier,
  ): ExecuteEspionageAction {
    return {
      id: this.createId("espionage"),
      nationId,
      type: "EXECUTE_ESPIONAGE_OPERATION",
      targetNationId,
      tier,
    };
  }
}
