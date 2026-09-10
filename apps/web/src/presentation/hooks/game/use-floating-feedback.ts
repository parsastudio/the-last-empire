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
  const [feedbacks, setFeedbacks] = useState<Map<TKey, FloatingFeedback[]>>(
    () => new Map(),
  );

  const triggerFeedback = useCallback(
    (
      key: TKey,
      content: string | number,
      options: FloatingFeedbackOptions = {},
    ) => {
      const { playSound = true, prefix = "+", durationMs = 600 } = options;

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

      setFeedbacks((prev) => {
        const next = new Map(prev);
        const currentList = next.get(key) || [];
        next.set(key, [...currentList, newFeedback]);
        return next;
      });

      setTimeout(() => {
        setFeedbacks((prev) => {
          const next = new Map(prev);
          const currentList = next.get(key);
          if (!currentList) return prev;
          const filtered = currentList.filter((item) => item.id !== newId);
          if (filtered.length === 0) {
            next.delete(key);
          } else {
            next.set(key, filtered);
          }
          return next;
        });
      }, durationMs);
    },
    [],
  );

  const getFeedbacksFor = useCallback(
    (key: TKey): FloatingFeedback[] => {
      return feedbacks.get(key) || [];
    },
    [feedbacks],
  );

  return {
    feedbacks,
    triggerFeedback,
    getFeedbacksFor,
  };
}
