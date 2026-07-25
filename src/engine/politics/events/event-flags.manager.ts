import { GameEventChoice } from "@/domain/game/events.schema";

export class EventFlagsManager {
  public updateEventFlags(
    eventFlags: Record<string, boolean>,
    choice: GameEventChoice,
  ): Record<string, boolean> {
    const currentFlags = { ...eventFlags };
    if (choice.effects.setFlags) {
      for (const flag of choice.effects.setFlags) {
        currentFlags[flag] = true;
      }
    }
    return currentFlags;
  }
}
