import Dexie, { type Table } from "dexie";
import { GameState } from "@geopolitics/domain";

export interface SavedGameStateRecord {
  gameId: string;
  state: GameState;
  timestamp: number;
}

export class GameDatabase extends Dexie {
  public gameStates!: Table<SavedGameStateRecord, string>;

  constructor() {
    super("GeopoliticsEngineDB_v2");
    this.version(1).stores({
      gameStates: "gameId, timestamp",
    });
  }
}

export const db = new GameDatabase();
