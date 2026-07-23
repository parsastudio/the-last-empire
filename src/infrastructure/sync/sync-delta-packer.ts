import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";

export interface DeltaPacket {
  gameId: string;
  turn: number;
  hash: string;
  timestamp: number;
  changes: Record<string, unknown>;
}

export class SyncDeltaPacker {
  public createPack(
    currentState: GameState,
    previousState: GameState | null,
    stateHash: string,
  ): DeltaPacket {
    const changes: Record<string, unknown> = {};
    if (!previousState) {
      return {
        gameId: currentState.gameId,
        turn: currentState.currentTurn,
        hash: stateHash,
        timestamp: Date.now(),
        changes: { fullState: currentState },
      };
    }
    const currentNations = currentState.nations;
    const previousNations = previousState.nations;
    for (const [id, nation] of Object.entries(currentNations)) {
      const prevNation = previousNations[id];
      if (!prevNation) {
        changes[`nations.${id}`] = nation;
        continue;
      }
      if (nation.treasury !== prevNation.treasury) {
        changes[`nations.${id}.treasury`] = nation.treasury;
      }
      if (nation.debt !== prevNation.debt) {
        changes[`nations.${id}.debt`] = nation.debt;
      }
      if (nation.gdp !== prevNation.gdp) {
        changes[`nations.${id}.gdp`] = nation.gdp;
      }
      if (nation.population !== prevNation.population) {
        changes[`nations.${id}.population`] = nation.population;
      }
      if (nation.government.stability !== prevNation.government.stability) {
        changes[`nations.${id}.government.stability`] =
          nation.government.stability;
      }
      if (nation.government.corruption !== prevNation.government.corruption) {
        changes[`nations.${id}.government.corruption`] =
          nation.government.corruption;
      }
    }
    return {
      gameId: currentState.gameId,
      turn: currentState.currentTurn,
      hash: stateHash,
      timestamp: Date.now(),
      changes,
    };
  }
}
