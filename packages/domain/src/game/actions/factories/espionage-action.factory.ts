import { ExecuteEspionageAction } from "@/domain/game/actions/schemas/espionage-action.schema";
import { EspionageTier } from "@/domain/espionage/espionage.schema";
import { GameIdGenerator } from "@/domain/shared/utils/game-id-generator";

export class EspionageActionFactory {
  public static executeEspionage(
    nationId: string,
    targetNationId: string,
    tier: EspionageTier,
  ): ExecuteEspionageAction {
    return {
      id: GameIdGenerator.generateId("espionage"),
      nationId,
      type: "EXECUTE_ESPIONAGE_OPERATION",
      targetNationId,
      tier,
    };
  }
}
