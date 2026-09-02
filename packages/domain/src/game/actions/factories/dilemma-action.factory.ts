import { ResolveDilemmaAction } from "@/domain/game/actions/schemas/dilemma-action.schema";

export class DilemmaActionFactory {
  private static createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  public static resolveDilemma(
    nationId: string,
    eventId: string,
    choiceId: string,
  ): ResolveDilemmaAction {
    return {
      id: this.createId("dilemma-resolve"),
      nationId,
      type: "RESOLVE_DILEMMA",
      eventId,
      choiceId,
    };
  }
}
