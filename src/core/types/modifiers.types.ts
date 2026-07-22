export type ModifierEffectType =
  | "MILITARY_POWER_MULT"
  | "DEFENSE_BONUS_MULT"
  | "GDP_GROWTH_MULT"
  | "TAX_INCOME_MULT"
  | "STABILITY_DELTA"
  | "REPUTATION_DELTA"
  | "MANPOWER_GROWTH_MULT";

export interface GameModifier {
  id: string;
  name: string;
  effectType: ModifierEffectType;
  magnitude: number;
  duration: number;
}
