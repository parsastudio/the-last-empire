import { ShieldCheck, Compass, Flame, Skull, LucideIcon } from "lucide-react";
import { GameDifficulty } from "@geopolitics/domain";

export interface DifficultyVisualConfig {
  icon: LucideIcon;
  textColor: string;
  borderColor: string;
  activeBorder: string;
  activeBg: string;
  badgeBg: string;
}

export const DIFFICULTY_VISUAL_CONFIGS: Record<
  GameDifficulty,
  DifficultyVisualConfig
> = {
  EASY: {
    icon: ShieldCheck,
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    activeBorder:
      "border-emerald-500 shadow-emerald-500/10 ring-emerald-500/40",
    activeBg: "bg-emerald-500/15",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  NORMAL: {
    icon: Compass,
    textColor: "text-primary",
    borderColor: "border-primary/30",
    activeBorder: "border-primary shadow-primary/10 ring-primary/40",
    activeBg: "bg-primary/15",
    badgeBg: "bg-primary/20 text-primary border-primary/40",
  },
  HARD: {
    icon: Flame,
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    activeBorder: "border-amber-500 shadow-amber-500/10 ring-amber-500/40",
    activeBg: "bg-amber-500/15",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  IMPOSSIBLE: {
    icon: Skull,
    textColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    activeBorder: "border-rose-500 shadow-rose-500/20 ring-rose-500/50",
    activeBg: "bg-rose-500/20",
    badgeBg: "bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse",
  },
};
