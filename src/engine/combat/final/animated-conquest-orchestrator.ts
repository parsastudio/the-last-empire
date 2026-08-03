import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";

export class AnimatedConquestOrchestrator {
  private facade = new BitPackedStateFacade();
  private animFrameId: number | null = null;

  public animateConquestStepByStep(
    attackerId: number,
    defenderId: number,
    totalAreaSqKm: number,
    stepsCount = 10,
    onStepComplete?: (conqueredSoFar: number) => void,
    onFinished?: () => void,
  ): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const areaPerStep = Math.max(1000, Math.floor(totalAreaSqKm / stepsCount));
    let currentStep = 0;
    let accumulatedConquered = 0;

    const stepLoop = () => {
      if (currentStep >= stepsCount) {
        if (onFinished) onFinished();
        this.animFrameId = null;
        return;
      }

      const conquered = this.facade.conquerAndRefreshed(
        attackerId,
        defenderId,
        areaPerStep,
      );
      accumulatedConquered += conquered;
      currentStep++;

      if (onStepComplete) {
        onStepComplete(accumulatedConquered);
      }

      if (conquered === 0) {
        if (onFinished) onFinished();
        this.animFrameId = null;
        return;
      }

      this.animFrameId = requestAnimationFrame(stepLoop);
    };

    stepLoop();
  }

  public stopAnimation(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
