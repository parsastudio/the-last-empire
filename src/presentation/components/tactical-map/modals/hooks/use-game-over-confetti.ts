import { useEffect } from "react";
import confetti from "canvas-confetti";

export function useGameOverConfetti(isOpen: boolean, isVictory: boolean) {
  useEffect(() => {
    if (isOpen && isVictory) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isOpen, isVictory]);
}
