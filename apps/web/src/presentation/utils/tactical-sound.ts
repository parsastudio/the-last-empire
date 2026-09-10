export type SoundEffectId =
  | "UI_CLICK"
  | "MAP_HOVER"
  | "CONTEXT_MENU"
  | "MODAL_OPEN"
  | "MODAL_CLOSE"
  | "SLIDER_TICK"
  | "TOAST_INFO"
  | "TOAST_SUCCESS"
  | "TOAST_WARNING"
  | "TOAST_ERROR"
  | "TURN_ADVANCE"
  | "COIN"
  | "INFANTRY_RECRUIT"
  | "ARMOR_RECRUIT"
  | "AIR_FORCE_RECRUIT"
  | "MISSILE_LAUNCH"
  | "NAVAL_RECRUIT"
  | "TECH_UPGRADE"
  | "FACTORY_BUILD"
  | "MACHINERY_EQUIP"
  | "IMF_LOAN"
  | "TREATY_SIGNED"
  | "TREATY_REJECTED"
  | "WAR_DECLARATION"
  | "COALITION_ALARM"
  | "SECURITY_GUARANTEE"
  | "PROTECTORATE_SIGNED"
  | "RECON_SCAN"
  | "SABOTAGE_EXPLOSION"
  | "TECH_HEIST"
  | "ESPIONAGE_FAILURE"
  | "PHASE_MISSILE"
  | "PHASE_AIR"
  | "PHASE_GROUND"
  | "DILEMMA_ALERT"
  | "VICTORY_FANFARE"
  | "DEFEAT_SOUND";

interface SynthToneLayer {
  type?: OscillatorType;
  freq: number;
  endFreq?: number;
  attack?: number;
  decay: number;
  gain: number;
  delay?: number;
  filterFreq?: number;
  filterType?: BiquadFilterType;
}

interface SynthNoiseLayer {
  duration: number;
  filterType: BiquadFilterType;
  filterStartFreq: number;
  filterEndFreq?: number;
  q?: number;
  gain: number;
  delay?: number;
}

interface SynthChordLayer {
  notes: number[];
  stepInterval: number;
  oscType?: OscillatorType;
  noteDecay: number;
  gain: number;
}

interface SoundPreset {
  volumeScale?: number;
  tones?: SynthToneLayer[];
  noise?: SynthNoiseLayer;
  chord?: SynthChordLayer;
  randomPitchRange?: number;
}

const SOUND_PRESETS: Record<SoundEffectId, SoundPreset> = {
  UI_CLICK: {
    volumeScale: 0.08,
    randomPitchRange: 0.04,
    tones: [
      {
        type: "sine",
        freq: 1800,
        endFreq: 900,
        decay: 0.025,
        gain: 0.8,
      },
      {
        type: "triangle",
        freq: 600,
        decay: 0.015,
        gain: 0.4,
      },
    ],
  },
  MAP_HOVER: {
    volumeScale: 0.025,
    randomPitchRange: 0.03,
    tones: [
      {
        type: "sine",
        freq: 2400,
        endFreq: 3000,
        decay: 0.02,
        gain: 0.7,
      },
    ],
  },
  SLIDER_TICK: {
    volumeScale: 0.04,
    randomPitchRange: 0.02,
    tones: [
      {
        type: "sine",
        freq: 2200,
        endFreq: 1400,
        decay: 0.012,
        gain: 0.5,
      },
    ],
  },
  CONTEXT_MENU: {
    volumeScale: 0.09,
    tones: [
      {
        type: "sine",
        freq: 920,
        endFreq: 1840,
        decay: 0.06,
        gain: 0.6,
      },
      {
        type: "triangle",
        freq: 1380,
        endFreq: 2760,
        decay: 0.06,
        gain: 0.4,
      },
    ],
  },
  MODAL_OPEN: {
    volumeScale: 0.12,
    tones: [
      {
        type: "sine",
        freq: 180,
        endFreq: 360,
        attack: 0.02,
        decay: 0.14,
        gain: 0.8,
        filterType: "lowpass",
        filterFreq: 1200,
      },
      {
        type: "triangle",
        freq: 360,
        endFreq: 720,
        decay: 0.16,
        gain: 0.3,
      },
    ],
  },
  MODAL_CLOSE: {
    volumeScale: 0.1,
    tones: [
      {
        type: "sine",
        freq: 380,
        endFreq: 140,
        decay: 0.08,
        gain: 0.7,
      },
    ],
  },
  TOAST_INFO: {
    volumeScale: 0.1,
    tones: [
      {
        type: "sine",
        freq: 880,
        decay: 0.12,
        gain: 0.6,
      },
    ],
  },
  TOAST_SUCCESS: {
    volumeScale: 0.12,
    tones: [
      {
        type: "sine",
        freq: 523.25,
        endFreq: 659.25,
        decay: 0.12,
        gain: 0.7,
      },
      {
        type: "sine",
        freq: 1046.5,
        delay: 0.05,
        decay: 0.18,
        gain: 0.8,
      },
    ],
  },
  TOAST_WARNING: {
    volumeScale: 0.12,
    tones: [
      {
        type: "triangle",
        freq: 587.33,
        decay: 0.16,
        gain: 0.7,
      },
      {
        type: "triangle",
        freq: 587.33,
        delay: 0.06,
        decay: 0.16,
        gain: 0.7,
      },
    ],
  },
  TOAST_ERROR: {
    volumeScale: 0.13,
    tones: [
      {
        type: "sawtooth",
        freq: 340,
        endFreq: 220,
        decay: 0.22,
        gain: 0.6,
        filterType: "lowpass",
        filterFreq: 800,
      },
      {
        type: "sine",
        freq: 170,
        endFreq: 110,
        decay: 0.25,
        gain: 0.7,
      },
    ],
  },
  TURN_ADVANCE: {
    volumeScale: 0.16,
    noise: {
      duration: 0.28,
      filterType: "bandpass",
      filterStartFreq: 600,
      filterEndFreq: 2400,
      gain: 0.6,
    },
    tones: [
      {
        type: "sine",
        freq: 220,
        endFreq: 440,
        delay: 0.08,
        decay: 0.24,
        gain: 0.8,
      },
      {
        type: "sine",
        freq: 440,
        endFreq: 880,
        delay: 0.12,
        decay: 0.22,
        gain: 0.6,
      },
    ],
  },
  COIN: {
    volumeScale: 0.12,
    randomPitchRange: 0.03,
    tones: [
      {
        type: "sine",
        freq: 987.77,
        endFreq: 1318.51,
        decay: 0.26,
        gain: 0.8,
      },
      {
        type: "triangle",
        freq: 1975.53,
        endFreq: 2637.02,
        delay: 0.05,
        decay: 0.2,
        gain: 0.6,
      },
    ],
  },
  INFANTRY_RECRUIT: {
    volumeScale: 0.14,
    randomPitchRange: 0.04,
    tones: [
      {
        type: "triangle",
        freq: 160,
        endFreq: 55,
        decay: 0.16,
        gain: 0.9,
      },
    ],
    noise: {
      duration: 0.08,
      filterType: "bandpass",
      filterStartFreq: 1400,
      gain: 0.4,
    },
  },
  ARMOR_RECRUIT: {
    volumeScale: 0.18,
    randomPitchRange: 0.03,
    tones: [
      {
        type: "sawtooth",
        freq: 85,
        endFreq: 38,
        decay: 0.35,
        gain: 0.85,
        filterType: "lowpass",
        filterFreq: 220,
      },
      {
        type: "sine",
        freq: 55,
        decay: 0.4,
        gain: 0.9,
      },
    ],
  },
  AIR_FORCE_RECRUIT: {
    volumeScale: 0.16,
    noise: {
      duration: 0.36,
      filterType: "bandpass",
      filterStartFreq: 500,
      filterEndFreq: 3200,
      gain: 0.85,
    },
    tones: [
      {
        type: "sine",
        freq: 440,
        endFreq: 880,
        attack: 0.05,
        decay: 0.3,
        gain: 0.4,
      },
    ],
  },
  MISSILE_LAUNCH: {
    volumeScale: 0.2,
    tones: [
      {
        type: "sawtooth",
        freq: 130,
        endFreq: 950,
        decay: 0.38,
        gain: 0.8,
        filterType: "lowpass",
        filterFreq: 1800,
      },
    ],
    noise: {
      duration: 0.36,
      filterType: "lowpass",
      filterStartFreq: 1000,
      gain: 0.9,
    },
  },
  NAVAL_RECRUIT: {
    volumeScale: 0.18,
    tones: [
      {
        type: "sawtooth",
        freq: 90,
        decay: 0.55,
        gain: 0.6,
        filterType: "lowpass",
        filterFreq: 280,
      },
      {
        type: "sine",
        freq: 135,
        decay: 0.55,
        gain: 0.5,
      },
    ],
  },
  TECH_UPGRADE: {
    volumeScale: 0.16,
    chord: {
      notes: [440, 554.37, 659.25, 880, 1108.73],
      stepInterval: 0.05,
      oscType: "sine",
      noteDecay: 0.28,
      gain: 0.65,
    },
  },
  FACTORY_BUILD: {
    volumeScale: 0.17,
    tones: [
      {
        type: "triangle",
        freq: 190,
        endFreq: 40,
        decay: 0.2,
        gain: 0.9,
      },
    ],
    noise: {
      duration: 0.14,
      filterType: "bandpass",
      filterStartFreq: 2800,
      q: 3,
      gain: 0.7,
    },
  },
  MACHINERY_EQUIP: {
    volumeScale: 0.15,
    chord: {
      notes: [340, 510, 680],
      stepInterval: 0.035,
      oscType: "triangle",
      noteDecay: 0.08,
      gain: 0.45,
    },
  },
  IMF_LOAN: {
    volumeScale: 0.18,
    tones: [
      {
        type: "sine",
        freq: 160,
        endFreq: 80,
        decay: 0.35,
        gain: 0.9,
      },
      {
        type: "sine",
        freq: 80,
        decay: 0.45,
        gain: 0.8,
      },
    ],
  },
  TREATY_SIGNED: {
    volumeScale: 0.16,
    tones: [
      {
        type: "sine",
        freq: 392,
        endFreq: 523.25,
        decay: 0.4,
        gain: 0.8,
      },
      {
        type: "triangle",
        freq: 587.33,
        endFreq: 783.99,
        decay: 0.4,
        gain: 0.5,
      },
    ],
  },
  TREATY_REJECTED: {
    volumeScale: 0.14,
    tones: [
      {
        type: "sawtooth",
        freq: 260,
        endFreq: 170,
        decay: 0.26,
        gain: 0.7,
        filterType: "lowpass",
        filterFreq: 600,
      },
    ],
  },
  WAR_DECLARATION: {
    volumeScale: 0.24,
    tones: [
      {
        type: "sawtooth",
        freq: 280,
        endFreq: 640,
        attack: 0.08,
        decay: 0.75,
        gain: 0.8,
        filterType: "lowpass",
        filterFreq: 1100,
      },
      {
        type: "sine",
        freq: 100,
        endFreq: 30,
        decay: 0.55,
        gain: 1.0,
      },
    ],
  },
  COALITION_ALARM: {
    volumeScale: 0.26,
    tones: [
      {
        type: "sawtooth",
        freq: 440,
        endFreq: 880,
        attack: 0.04,
        decay: 0.3,
        gain: 0.85,
        filterType: "lowpass",
        filterFreq: 1400,
      },
      {
        type: "sawtooth",
        freq: 880,
        endFreq: 440,
        delay: 0.28,
        attack: 0.04,
        decay: 0.35,
        gain: 0.85,
        filterType: "lowpass",
        filterFreq: 1400,
      },
      {
        type: "sine",
        freq: 80,
        decay: 0.7,
        gain: 0.9,
      },
    ],
  },
  SECURITY_GUARANTEE: {
    volumeScale: 0.18,
    tones: [
      {
        type: "sine",
        freq: 440,
        decay: 0.45,
        gain: 0.8,
      },
      {
        type: "sine",
        freq: 659.25,
        delay: 0.08,
        decay: 0.5,
        gain: 0.65,
      },
    ],
  },
  PROTECTORATE_SIGNED: {
    volumeScale: 0.22,
    tones: [
      {
        type: "sawtooth",
        freq: 80,
        endFreq: 55,
        attack: 0.08,
        decay: 0.7,
        gain: 0.9,
        filterType: "lowpass",
        filterFreq: 220,
      },
      {
        type: "sine",
        freq: 40,
        decay: 0.8,
        gain: 0.9,
      },
    ],
  },
  RECON_SCAN: {
    volumeScale: 0.1,
    tones: [
      {
        type: "sine",
        freq: 1600,
        endFreq: 3400,
        decay: 0.16,
        gain: 0.7,
      },
    ],
  },
  SABOTAGE_EXPLOSION: {
    volumeScale: 0.25,
    noise: {
      duration: 0.45,
      filterType: "lowpass",
      filterStartFreq: 700,
      filterEndFreq: 70,
      gain: 1.0,
    },
    tones: [
      {
        type: "sine",
        freq: 90,
        endFreq: 30,
        decay: 0.4,
        gain: 1.0,
      },
    ],
  },
  TECH_HEIST: {
    volumeScale: 0.14,
    chord: {
      notes: [1200, 1600, 2000, 2400],
      stepInterval: 0.035,
      oscType: "sine",
      noteDecay: 0.08,
      gain: 0.6,
    },
  },
  ESPIONAGE_FAILURE: {
    volumeScale: 0.16,
    chord: {
      notes: [220, 160, 110],
      stepInterval: 0.07,
      oscType: "sawtooth",
      noteDecay: 0.3,
      gain: 0.7,
    },
  },
  PHASE_MISSILE: {
    volumeScale: 0.2,
    tones: [
      {
        type: "sawtooth",
        freq: 480,
        endFreq: 85,
        decay: 0.3,
        gain: 0.9,
      },
    ],
  },
  PHASE_AIR: {
    volumeScale: 0.15,
    tones: [
      {
        type: "triangle",
        freq: 1300,
        endFreq: 380,
        decay: 0.24,
        gain: 0.8,
      },
    ],
  },
  PHASE_GROUND: {
    volumeScale: 0.22,
    tones: [
      {
        type: "sine",
        freq: 110,
        endFreq: 30,
        decay: 0.35,
        gain: 1.0,
      },
    ],
  },
  DILEMMA_ALERT: {
    volumeScale: 0.18,
    chord: {
      notes: [523.25, 659.25, 783.99, 1046.5],
      stepInterval: 0.065,
      oscType: "sine",
      noteDecay: 0.24,
      gain: 0.7,
    },
  },
  VICTORY_FANFARE: {
    volumeScale: 0.22,
    chord: {
      notes: [523.25, 659.25, 783.99, 1046.5],
      stepInterval: 0.12,
      oscType: "triangle",
      noteDecay: 0.45,
      gain: 0.7,
    },
  },
  DEFEAT_SOUND: {
    volumeScale: 0.2,
    chord: {
      notes: [330, 293.66, 261.63, 220],
      stepInterval: 0.22,
      oscType: "sawtooth",
      noteDecay: 0.48,
      gain: 0.8,
    },
  },
};

export class TacticalSound {
  private static audioCtx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static limiter: DynamicsCompressorNode | null = null;
  private static lastHoverTime = 0;
  private static lastSliderTime = 0;

  private static muted: boolean =
    typeof window !== "undefined"
      ? localStorage.getItem("tactical_sound_muted") === "true"
      : false;
  private static masterVolume = 0.8;

  private static ensureContext(): AudioContext | null {
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
      this.masterGain.gain.setValueAtTime(
        this.muted ? 0 : this.masterVolume,
        this.audioCtx.currentTime,
      );

      this.limiter.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === "suspended") {
      void this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  public static isMuted(): boolean {
    return this.muted;
  }

  public static setMuted(mute: boolean): void {
    this.muted = mute;
    if (typeof window !== "undefined") {
      localStorage.setItem("tactical_sound_muted", String(mute));
    }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(
        mute ? 0 : this.masterVolume,
        this.audioCtx.currentTime,
      );
    }
  }

  public static toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public static setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx && !this.muted) {
      this.masterGain.gain.setValueAtTime(
        this.masterVolume,
        this.audioCtx.currentTime,
      );
    }
  }

  public static getVolume(): number {
    return this.masterVolume;
  }

  private static createNoiseBuffer(
    ctx: AudioContext,
    duration: number,
  ): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public static play(soundId: SoundEffectId): void {
    if (this.muted) return;

    const ctx = this.ensureContext();
    if (!ctx || !this.limiter) return;

    const preset = SOUND_PRESETS[soundId];
    if (!preset) return;

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
      for (let i = 0; i < preset.tones.length; i++) {
        const t = preset.tones[i]!;
        const startTime = now + (t.delay || 0);
        const toneDuration = (t.delay || 0) + t.decay + 0.05;
        if (toneDuration > longestDuration) {
          longestDuration = toneDuration;
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = t.type || "sine";
        const baseFreq = t.freq * pitchMultiplier;
        osc.frequency.setValueAtTime(baseFreq, startTime);

        if (t.endFreq) {
          osc.frequency.exponentialRampToValueAtTime(
            t.endFreq * pitchMultiplier,
            startTime + t.decay,
          );
        }

        if (t.attack) {
          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(t.gain, startTime + t.attack);
        } else {
          gain.gain.setValueAtTime(t.gain, startTime);
        }
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + t.decay);

        let targetNode: AudioNode = gain;
        let filter: BiquadFilterNode | null = null;

        if (t.filterType && t.filterFreq) {
          filter = ctx.createBiquadFilter();
          filter.type = t.filterType;
          filter.frequency.setValueAtTime(t.filterFreq, startTime);
          gain.connect(filter);
          targetNode = filter;
        }

        osc.connect(gain);
        targetNode.connect(soundBusGain);

        osc.start(startTime);
        osc.stop(startTime + t.decay);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
          if (filter) filter.disconnect();
        };
      }
    }

    if (preset.noise) {
      const n = preset.noise;
      const startTime = now + (n.delay || 0);
      const noiseDuration = (n.delay || 0) + n.duration + 0.05;
      if (noiseDuration > longestDuration) {
        longestDuration = noiseDuration;
      }

      const noiseBuffer = this.createNoiseBuffer(ctx, n.duration);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = n.filterType;
      filter.frequency.setValueAtTime(n.filterStartFreq, startTime);
      if (n.filterEndFreq) {
        filter.frequency.exponentialRampToValueAtTime(
          n.filterEndFreq,
          startTime + n.duration,
        );
      }
      if (n.q) {
        filter.Q.setValueAtTime(n.q, startTime);
      }

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(n.gain, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + n.duration,
      );

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(soundBusGain);

      noiseSource.start(startTime);
      noiseSource.stop(startTime + n.duration);

      noiseSource.onended = () => {
        noiseSource.disconnect();
        filter.disconnect();
        noiseGain.disconnect();
      };
    }

    if (preset.chord) {
      const c = preset.chord;
      const chordDuration =
        c.notes.length * c.stepInterval + c.noteDecay + 0.05;
      if (chordDuration > longestDuration) {
        longestDuration = chordDuration;
      }

      c.notes.forEach((freq, idx) => {
        const noteTime = now + idx * c.stepInterval;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = c.oscType || "sine";
        osc.frequency.setValueAtTime(freq * pitchMultiplier, noteTime);

        gain.gain.setValueAtTime(c.gain, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + c.noteDecay);

        osc.connect(gain);
        gain.connect(soundBusGain);

        osc.start(noteTime);
        osc.stop(noteTime + c.noteDecay);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    }

    setTimeout(
      () => {
        soundBusGain.disconnect();
      },
      Math.ceil(longestDuration * 1000) + 50,
    );
  }

  public static playUiClick(): void {
    this.play("UI_CLICK");
  }

  public static playMapHover(): void {
    const now = Date.now();
    if (now - this.lastHoverTime < 75) return;
    this.lastHoverTime = now;
    this.play("MAP_HOVER");
  }

  public static playSliderTick(): void {
    const now = Date.now();
    if (now - this.lastSliderTime < 40) return;
    this.lastSliderTime = now;
    this.play("SLIDER_TICK");
  }

  public static playContextMenu(): void {
    this.play("CONTEXT_MENU");
  }

  public static playModalOpen(): void {
    this.play("MODAL_OPEN");
  }

  public static playModalClose(): void {
    this.play("MODAL_CLOSE");
  }

  public static playToastAlert(
    type: "info" | "warning" | "error" | "success" = "info",
  ): void {
    switch (type) {
      case "success":
        this.play("TOAST_SUCCESS");
        break;
      case "warning":
        this.play("TOAST_WARNING");
        break;
      case "error":
        this.play("TOAST_ERROR");
        break;
      case "info":
      default:
        this.play("TOAST_INFO");
        break;
    }
  }

  public static playTurnAdvance(): void {
    this.play("TURN_ADVANCE");
  }

  public static playCoinSound(): void {
    this.play("COIN");
  }

  public static playInfantryRecruit(): void {
    this.play("INFANTRY_RECRUIT");
  }

  public static playArmorRecruit(): void {
    this.play("ARMOR_RECRUIT");
  }

  public static playAirForceRecruit(): void {
    this.play("AIR_FORCE_RECRUIT");
  }

  public static playMissileLaunch(): void {
    this.play("MISSILE_LAUNCH");
  }

  public static playNavalRecruit(): void {
    this.play("NAVAL_RECRUIT");
  }

  public static playTechUpgrade(): void {
    this.play("TECH_UPGRADE");
  }

  public static playFactoryBuild(): void {
    this.play("FACTORY_BUILD");
  }

  public static playMachineryEquip(): void {
    this.play("MACHINERY_EQUIP");
  }

  public static playImfLoan(): void {
    this.play("IMF_LOAN");
  }

  public static playTreatySigned(): void {
    this.play("TREATY_SIGNED");
  }

  public static playTreatyRejected(): void {
    this.play("TREATY_REJECTED");
  }

  public static playWarDeclaration(): void {
    this.play("WAR_DECLARATION");
  }

  public static playCoalitionAlarm(): void {
    this.play("COALITION_ALARM");
  }

  public static playSecurityGuarantee(): void {
    this.play("SECURITY_GUARANTEE");
  }

  public static playProtectorateSigned(): void {
    this.play("PROTECTORATE_SIGNED");
  }

  public static playReconScan(): void {
    this.play("RECON_SCAN");
  }

  public static playSabotageExplosion(): void {
    this.play("SABOTAGE_EXPLOSION");
  }

  public static playTechHeist(): void {
    this.play("TECH_HEIST");
  }

  public static playEspionageFailure(): void {
    this.play("ESPIONAGE_FAILURE");
  }

  public static playPhaseMissile(): void {
    this.play("PHASE_MISSILE");
  }

  public static playPhaseAir(): void {
    this.play("PHASE_AIR");
  }

  public static playPhaseGround(): void {
    this.play("PHASE_GROUND");
  }

  public static playDilemmaAlert(): void {
    this.play("DILEMMA_ALERT");
  }

  public static playVictoryFanfare(): void {
    this.play("VICTORY_FANFARE");
  }

  public static playDefeatSound(): void {
    this.play("DEFEAT_SOUND");
  }
}
