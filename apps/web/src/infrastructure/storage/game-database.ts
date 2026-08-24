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
  timestamp: number;
  log: TurnLogEntry;
}

export class GameDatabase extends Dexie {
  public gameStates!: Table<SavedGameStateRecord, string>;
  public turnLogs!: Table<SavedTurnLogRecord, string>;

  constructor() {
    super("GeopoliticsEngineDB_v2");
    this.version(2).stores({
      gameStates: "gameId, timestamp",
      turnLogs: "id, gameId, [gameId+turn], timestamp",
    });
  }
}

export const db = new GameDatabase();
