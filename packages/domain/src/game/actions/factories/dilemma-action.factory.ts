import { ResolveDilemmaAction } from "@/domain/game/actions/schemas/dilemma-action.schema";
import { GameIdGenerator } from "@/domain/shared/utils/game-id-generator";

export class DilemmaActionFactory {
  public static resolveDilemma(
    nationId: string,
    eventId: string,
    choiceId: string,
  ): ResolveDilemmaAction {
    return {
      id: GameIdGenerator.generateId("dilemma-resolve"),
      nationId,
      type: "RESOLVE_DILEMMA",
      eventId,
      choiceId,
    };
  }
}
