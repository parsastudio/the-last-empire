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

export interface SynthToneLayer {
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

export interface SynthNoiseLayer {
  duration: number;
  filterType: BiquadFilterType;
  filterStartFreq: number;
  filterEndFreq?: number;
  q?: number;
  gain: number;
  delay?: number;
}

export interface SynthChordLayer {
  notes: number[];
  stepInterval: number;
  oscType?: OscillatorType;
  noteDecay: number;
  gain: number;
}

export interface SoundPreset {
  volumeScale?: number;
  tones?: SynthToneLayer[];
  noise?: SynthNoiseLayer;
  chord?: SynthChordLayer;
  randomPitchRange?: number;
}

export const SOUND_PRESETS: Record<SoundEffectId, SoundPreset> = {
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
