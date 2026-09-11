import Dexie, { type Table } from "dexie";
import { z } from "zod";
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

export const BinaryAssetRecordSchema = z.object({
  key: z.string().min(1),
  data: z.instanceof(ArrayBuffer),
  timestamp: z.number().int().positive(),
});

export type SavedBinaryAssetRecord = z.infer<typeof BinaryAssetRecordSchema>;

export class GameDatabase extends Dexie {
  public gameStates!: Table<SavedGameStateRecord, string>;
  public turnLogs!: Table<SavedTurnLogRecord, string>;
  public binaryAssets!: Table<SavedBinaryAssetRecord, string>;

  constructor() {
    super("GeopoliticsEngineDB_v2");
    this.version(4).stores({
      gameStates: "gameId, timestamp",
      turnLogs:
        "id, gameId, turn, [gameId+turn], [gameId+scope], [gameId+category], [gameId+scope+turn], timestamp",
      binaryAssets: "key, timestamp",
    });
  }
}

export const db = new GameDatabase();
