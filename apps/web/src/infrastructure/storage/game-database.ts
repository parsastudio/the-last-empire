import Dexie, { type Table } from "dexie";
import { GameState, TurnLogEntry } from "@geopolitics/domain";

export interface SavedGameStateRecord {
  gameId: string;
  state: GameState;
  timestamp: number;
}

export interface SavedTurnLogRecord {
  id: string;
  gameId: string;
  turn: number;
  scope: string;
  category: string;
  timestamp: number;
  log: TurnLogEntry;
}

export class GameDatabase extends Dexie {
  public gameStates!: Table<SavedGameStateRecord, string>;
  public turnLogs!: Table<SavedTurnLogRecord, string>;

  constructor() {
    super("GeopoliticsEngineDB_v2");
    this.version(3).stores({
      gameStates: "gameId, timestamp",
      turnLogs:
        "id, gameId, turn, [gameId+turn], [gameId+scope], [gameId+category], [gameId+scope+turn], timestamp",
    });
  }
}

export const db = new GameDatabase();
