import { useState, useCallback } from "react";
import type { GameState } from "@/core/types/game-state.types";
import type { GameEvent } from "@/core/types/events.types";
import { EventChoiceHandler } from "../domain/event-choice-handler";

export function useEvents(
  initialState: GameState,
  onStateUpdate: (state: GameState) => void,
) {
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const choiceHandler = new EventChoiceHandler();

  const triggerEventModal = useCallback((event: GameEvent) => {
    setActiveEvent(event);
  }, []);

  const selectEventChoice = useCallback(
    (nationId: string, choiceId: string) => {
      if (!activeEvent) {
        return;
      }
      const updatedState = choiceHandler.selectChoice(
        initialState,
        nationId,
        activeEvent,
        choiceId,
      );
      onStateUpdate(updatedState);
      setActiveEvent(null);
    },
    [activeEvent, initialState, onStateUpdate, choiceHandler],
  );

  return {
    activeEvent,
    triggerEventModal,
    selectEventChoice,
    closeEventModal: () => setActiveEvent(null),
  };
}
