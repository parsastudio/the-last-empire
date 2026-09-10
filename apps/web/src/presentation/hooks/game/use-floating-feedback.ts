import { useState, useCallback } from "react";
import { GameIdGenerator } from "@geopolitics/domain";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

export interface FloatingFeedback {
  id: string;
  text: string;
}

export interface FloatingFeedbackOptions {
  playSound?: boolean;
  prefix?: string;
  durationMs?: number;
}

export function useFloatingFeedback<TKey extends string | number = string>() {
  const [feedbacks, setFeedbacks] = useState<
    Record<string, FloatingFeedback[]>
  >({});

  const triggerFeedback = useCallback(
    (
      key: TKey,
      content: string | number,
      options: FloatingFeedbackOptions = {},
    ) => {
      const { playSound = false, prefix = "+", durationMs = 600 } = options;

      if (playSound) {
        TacticalSound.playCoinSound();
      }

      const text =
        typeof content === "number" ? `${prefix}${content}` : content;

      const newId = GameIdGenerator.generateId("fb");
      const newFeedback: FloatingFeedback = {
        id: newId,
        text,
      };

      const keyStr = String(key);

      setFeedbacks((prev) => ({
        ...prev,
        [keyStr]: [...(prev[keyStr] || []), newFeedback],
      }));

      setTimeout(() => {
        setFeedbacks((prev) => {
          const currentList = prev[keyStr];
          if (!currentList) return prev;
          const filtered = currentList.filter((item) => item.id !== newId);
          return {
            ...prev,
            [keyStr]: filtered,
          };
        });
      }, durationMs);
    },
    [],
  );

  const getFeedbacksFor = useCallback(
    (key: TKey): FloatingFeedback[] => {
      return feedbacks[String(key)] || [];
    },
    [feedbacks],
  );

  return {
    feedbacks,
    triggerFeedback,
    getFeedbacksFor,
  };
}
