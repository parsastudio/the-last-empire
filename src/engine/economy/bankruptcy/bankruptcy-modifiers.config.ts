import { ActiveModifier } from "@/domain/nation/nation.schema";

export const BANKRUPTCY_STRUCTURAL_DECAY: ActiveModifier = {
  id: "bankruptcy-structural-decay",
  name: "Bankruptcy Economic Decay",
  effectType: "GDP_GROWTH_MULT",
  magnitude: -0.15,
  turnsRemaining: 10,
};

export const BANKRUPTCY_DEBT_HOLIDAY: ActiveModifier = {
  id: "bankruptcy-debt-holiday",
  name: "Debt Restructuring Period",
  effectType: "BANKRUPTCY_HOLIDAY",
  magnitude: 0,
  turnsRemaining: 15,
};

export const BANKRUPTCY_BAD_CREDIT: ActiveModifier = {
  id: "bankruptcy-bad-credit",
  name: "Ruined Credit Rating",
  effectType: "CREDIT_RATING_MULT",
  magnitude: -80,
  turnsRemaining: 20,
};
