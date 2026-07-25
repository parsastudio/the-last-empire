import { CombatContext } from "@/engine/combat/stages/combat-context";

export interface CombatStage {
  process(context: CombatContext): void;
}
