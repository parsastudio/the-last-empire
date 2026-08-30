import confetti from "canvas-confetti";

export class TacticalEffects {
  public static fireVictoryConfetti(particleCount = 140): void {
    if (typeof window === "undefined") return;
    try {
      confetti({
        particleCount,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#3b82f6", "#ffffff"],
      });
    } catch {}
  }
}
