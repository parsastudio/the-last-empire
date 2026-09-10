import {
  SoundPreset,
  SynthChordLayer,
  SynthNoiseLayer,
  SynthToneLayer,
} from "@/presentation/configs/tactical-sound-presets.config";

export class TacticalSoundSynthesizer {
  private static instance: TacticalSoundSynthesizer | null = null;
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;

  public static getInstance(): TacticalSoundSynthesizer {
    if (!this.instance) {
      this.instance = new TacticalSoundSynthesizer();
    }
    return this.instance;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return null;

      this.audioCtx = new AudioContextClass();

      this.limiter = this.audioCtx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-3, this.audioCtx.currentTime);
      this.limiter.knee.setValueAtTime(6, this.audioCtx.currentTime);
      this.limiter.ratio.setValueAtTime(12, this.audioCtx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
      this.limiter.release.setValueAtTime(0.2, this.audioCtx.currentTime);

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.audioCtx.currentTime);

      this.limiter.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === "suspended") {
      void this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  public setMasterVolume(volume: number, isMuted: boolean): void {
    if (this.masterGain && this.audioCtx) {
      const targetGain = isMuted ? 0 : Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setValueAtTime(
        targetGain,
        this.audioCtx.currentTime,
      );
    }
  }

  private createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private scheduleTone(
    ctx: AudioContext,
    destination: AudioNode,
    tone: SynthToneLayer,
    now: number,
    pitchMultiplier: number,
  ): number {
    const startTime = now + (tone.delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = tone.type || "sine";
    const baseFreq = tone.freq * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq, startTime);

    if (tone.endFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        tone.endFreq * pitchMultiplier,
        startTime + tone.decay,
      );
    }

    if (tone.attack) {
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(tone.gain, startTime + tone.attack);
    } else {
      gain.gain.setValueAtTime(tone.gain, startTime);
    }
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + tone.decay);

    let targetNode: AudioNode = gain;
    let filter: BiquadFilterNode | null = null;

    if (tone.filterType && tone.filterFreq) {
      filter = ctx.createBiquadFilter();
      filter.type = tone.filterType;
      filter.frequency.setValueAtTime(tone.filterFreq, startTime);
      gain.connect(filter);
      targetNode = filter;
    }

    osc.connect(gain);
    targetNode.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + tone.decay);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      if (filter) filter.disconnect();
    };

    return (tone.delay || 0) + tone.decay + 0.05;
  }

  private scheduleNoise(
    ctx: AudioContext,
    destination: AudioNode,
    noise: SynthNoiseLayer,
    now: number,
  ): number {
    const startTime = now + (noise.delay || 0);
    const noiseBuffer = this.createNoiseBuffer(ctx, noise.duration);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = noise.filterType;
    filter.frequency.setValueAtTime(noise.filterStartFreq, startTime);
    if (noise.filterEndFreq) {
      filter.frequency.exponentialRampToValueAtTime(
        noise.filterEndFreq,
        startTime + noise.duration,
      );
    }
    if (noise.q) {
      filter.Q.setValueAtTime(noise.q, startTime);
    }

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(noise.gain, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + noise.duration,
    );

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(destination);

    noiseSource.start(startTime);
    noiseSource.stop(startTime + noise.duration);

    noiseSource.onended = () => {
      noiseSource.disconnect();
      filter.disconnect();
      noiseGain.disconnect();
    };

    return (noise.delay || 0) + noise.duration + 0.05;
  }

  private scheduleChord(
    ctx: AudioContext,
    destination: AudioNode,
    chord: SynthChordLayer,
    now: number,
    pitchMultiplier: number,
  ): number {
    chord.notes.forEach((freq, idx) => {
      const noteTime = now + idx * chord.stepInterval;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = chord.oscType || "sine";
      osc.frequency.setValueAtTime(freq * pitchMultiplier, noteTime);

      gain.gain.setValueAtTime(chord.gain, noteTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteTime + chord.noteDecay,
      );

      osc.connect(gain);
      gain.connect(destination);

      osc.start(noteTime);
      osc.stop(noteTime + chord.noteDecay);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });

    return chord.notes.length * chord.stepInterval + chord.noteDecay + 0.05;
  }

  public synthesize(preset: SoundPreset): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.limiter) return;

    const now = ctx.currentTime;
    const soundBusGain = ctx.createGain();
    soundBusGain.gain.setValueAtTime(preset.volumeScale ?? 0.15, now);
    soundBusGain.connect(this.limiter);

    let longestDuration = 0.05;

    const pitchMultiplier =
      preset.randomPitchRange && preset.randomPitchRange > 0
        ? 1 + (Math.random() * 2 - 1) * preset.randomPitchRange
        : 1;

    if (preset.tones) {
      for (const tone of preset.tones) {
        const duration = this.scheduleTone(
          ctx,
          soundBusGain,
          tone,
          now,
          pitchMultiplier,
        );
        if (duration > longestDuration) {
          longestDuration = duration;
        }
      }
    }

    if (preset.noise) {
      const duration = this.scheduleNoise(ctx, soundBusGain, preset.noise, now);
      if (duration > longestDuration) {
        longestDuration = duration;
      }
    }

    if (preset.chord) {
      const duration = this.scheduleChord(
        ctx,
        soundBusGain,
        preset.chord,
        now,
        pitchMultiplier,
      );
      if (duration > longestDuration) {
        longestDuration = duration;
      }
    }

    setTimeout(
      () => {
        soundBusGain.disconnect();
      },
      Math.ceil(longestDuration * 1000) + 50,
    );
  }
}
