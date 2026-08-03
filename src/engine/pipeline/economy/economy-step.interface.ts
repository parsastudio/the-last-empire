import { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/domain-utilities";

export interface EconomyStepContext {
  state: GameState;
  prng: SeededRandom;
  totalOilDemand: number;
  totalOilSupply: number;
  totalSteelDemand: number;
  totalSteelSupply: number;
}

export interface EconomyStep {
  execute(context: EconomyStepContext): void;
}
