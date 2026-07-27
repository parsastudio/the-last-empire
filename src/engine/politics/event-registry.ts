import type { GameEvent } from "@/domain/game/events.schema";
import { DEFAULT_EVENTS_DATA } from "./event-list.config";

export class EventRegistry {
  private events: GameEvent[] = [];

  constructor() {
    this.registerDefaultEvents();
  }

  public register(event: GameEvent): void {
    if (!this.events.some((e) => e.id === event.id)) {
      this.events.push(event);
    }
  }

  public getAllEvents(): readonly GameEvent[] {
    return Object.freeze([...this.events]);
  }

  private registerDefaultEvents(): void {
    for (const event of DEFAULT_EVENTS_DATA) {
      this.register(event);
    }
  }
}
