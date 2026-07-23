import { StateSerializer } from "../state-serializer";
import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";

export function runSerializerCircularTest(): boolean {
  const serializer = new StateSerializer();

  const mockState = {
    gameId: "SERIALIZER_CIRCULAR_TEST_GAME",
    currentTurn: 1,
    seed: 777,
    isGameOver: false,
    humanNationId: "USA",
    globalThreatLevel: 0,
    marketPrices: { oil: 100, steel: 100 },
    turnLogs: [],
    eventFlags: {},
    nations: {},
  } as unknown as GameState;

  const circularRef: Record<string, unknown> = {
    nested: {},
  };
  circularRef.nested = circularRef;

  let serializationSucceeded = false;
  try {
    const stringified = serializer.serialize(mockState);
    const parsed = serializer.deserialize(stringified);
    if (parsed.gameId === mockState.gameId) {
      serializationSucceeded = true;
    }
  } catch {
    serializationSucceeded = false;
  }

  return serializationSucceeded;
}
