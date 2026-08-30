import { useState, useCallback } from "react";
import { UnitType } from "@geopolitics/domain";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

export interface FloatingFeedback {
  id: string;
  text: string;
}

export function useFloatingFeedback() {
  const [feedbacks, setFeedbacks] = useState<
    Record<UnitType, FloatingFeedback[]>
  >({
    INFANTRY: [],
    ARMOR: [],
    AIR_DEFENSE: [],
    AIR_FORCE: [],
    DRONE_MISSILE: [],
  });

  const triggerFeedback = useCallback((type: UnitType, quantity: number) => {
    TacticalSound.playCoinSound();

    const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newFeedback: FloatingFeedback = {
      id: newId,
      text: `+${quantity}`,
    };

    setFeedbacks((prev) => ({
      ...prev,
      [type]: [...prev[type], newFeedback],
    }));

    setTimeout(() => {
      setFeedbacks((prev) => ({
        ...prev,
        [type]: prev[type].filter((item) => item.id !== newId),
      }));
    }, 600);
  }, []);

  return {
    feedbacks,
    triggerFeedback,
  };
}
