import { useState, useCallback, useMemo } from "react";
import type { GameState, GameEvent } from "@/core/types";
import { EventChoiceHandler } from "../domain/event-choice-handler";

export function useEvents(
  initialState: GameState,
  onStateUpdate: (state: GameState) => void,
) {
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const choiceHandler = useMemo(() => new EventChoiceHandler(), []);

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
