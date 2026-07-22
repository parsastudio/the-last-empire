import type { Nation } from "./nation.types";
import type { TurnLogEntry } from "./turn-log.types";
import type { ResourceMarketPrice } from "./resources.types";

export interface GameState {
  gameId: string;
  currentTurn: number;
  seed: number;
  isGameOver: boolean;
  winnerNationId?: string;
  humanNationId: string;
  globalThreatLevel: number;
  marketPrices: ResourceMarketPrice;
  nations: Record<string, Nation>;
  turnLogs: TurnLogEntry[];
  eventFlags: Record<string, boolean>;
}
