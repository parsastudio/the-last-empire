export class TacticalSound {
  private static audioCtx: AudioContext | null = null;

  private static getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      void this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public static playCoinSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(987.77, now);
      osc1.frequency.setValueAtTime(1318.51, now + 0.06);

      osc2.frequency.setValueAtTime(1975.53, now);
      osc2.frequency.setValueAtTime(2637.02, now + 0.06);

      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 0.28);
      osc2.stop(now + 0.28);
    } catch {}
  }
}
