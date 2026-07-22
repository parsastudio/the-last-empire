import { CombatContext } from "./combat-context";

export interface CombatStage {
  process(context: CombatContext): void;
}
