import Dexie, { type Table } from "dexie";
import { GameState } from "@/domain/game/game-state.schema";

export interface SavedGameStateRecord {
  gameId: string;
  state: GameState;
  timestamp: number;
}

export interface SavedBitBufferRecord {
  gameId: string;
  buffer: ArrayBuffer | SharedArrayBuffer;
  timestamp: number;
}

export class GameDatabase extends Dexie {
  public gameStates!: Table<SavedGameStateRecord, string>;
  public bitBuffers!: Table<SavedBitBufferRecord, string>;

  constructor() {
    super("GeopoliticsEngineDB_v2");
    this.version(1).stores({
      gameStates: "gameId, timestamp",
      bitBuffers: "gameId, timestamp",
    });
  }
}

export const db = new GameDatabase();
