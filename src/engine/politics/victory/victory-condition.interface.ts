import { GameState } from "@/domain/game/game-state.schema";
import { VictoryStatus } from "../victory-checker";

export interface VictoryCondition {
  evaluate(state: GameState): VictoryStatus | null;
}
