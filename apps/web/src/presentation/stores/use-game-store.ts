import { create } from "zustand";
import {
  GameState,
  GameAction,
  SeededRandom,
  FinalMapManifest,
  GameDifficulty,
} from "@geopolitics/domain";
import { CampaignInitializationService } from "@/presentation/stores/services/campaign-initialization-service";
import { GamePersistenceService } from "@/presentation/stores/services/game-persistence-service";
import { TurnLogRepository } from "@/infrastructure/storage/repositories/turn-log.repository";
import { SimulationWorkerClient } from "@/infrastructure/workers/simulation-worker.client";

interface GameStoreState {
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  activeGameId: string;

  loadGame: (gameId: string) => Promise<boolean>;
  createCampaign: (
    nationId: string,
    governmentType: string,
    gameId: string,
    manifest?: FinalMapManifest | null,
    difficulty?: GameDifficulty,
  ) => Promise<boolean>;
  dispatchAction: (
    action: GameAction,
    onSuccessMessage?: string,
  ) => Promise<{ success: boolean; message: string; resultData?: unknown }>;
  advanceNextTurn: () => Promise<GameState | null>;
  enableSandboxMode: () => Promise<void>;
}

const workerClient = SimulationWorkerClient.getInstance();

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: null,
  loading: false,
  error: null,
  activeGameId: "default_game",

  loadGame: async (gameId) => {
    set({
      loading: true,
      error: null,
      activeGameId: gameId,
    });

    try {
      const updatedState = await GamePersistenceService.loadGameState(gameId);
      if (updatedState) {
        if (updatedState.turnLogs && updatedState.turnLogs.length > 0) {
          void TurnLogRepository.appendLogs(gameId, updatedState.turnLogs);
        }

        set({
          gameState: updatedState,
          loading: false,
        });
        return true;
      }

      set({
        error: "Campaign record not found.",
        loading: false,
      });
      return false;
    } catch (err) {
      console.error("Failed to load state from storage:", err);
      set({
        error: "Failed to load state from storage.",
        loading: false,
      });
      return false;
    }
  },

  createCampaign: async (
    nationId,
    governmentType,
    gameId,
    manifest,
    difficulty = "NORMAL",
  ) => {
    set({
      loading: true,
      error: null,
      activeGameId: gameId,
    });

    try {
      const initialState =
        await CampaignInitializationService.createInitialGameState(
          nationId,
          governmentType,
          gameId,
          manifest,
          difficulty,
        );

      await GamePersistenceService.saveGameStateImmediate(gameId, initialState);
      if (initialState.turnLogs && initialState.turnLogs.length > 0) {
        await TurnLogRepository.appendLogs(gameId, initialState.turnLogs);
      }

      set({
        gameState: initialState,
        loading: false,
      });
      return true;
    } catch (err) {
      console.error("Failed to initialize new campaign:", err);
      set({
        error: "Failed to initialize new campaign.",
        loading: false,
      });
      return false;
    }
  },

  dispatchAction: async (action, onSuccessMessage) => {
    const { activeGameId, gameState } = get();
    if (!gameState) {
      return {
        success: false,
        message: "Campaign record not found.",
      };
    }

    try {
      const previousLogsCount = gameState.turnLogs.length;
      const result = await workerClient.executeAction(gameState, action);

      if (result.newState) {
        set({
          gameState: result.newState,
        });

        const nextLogs = result.newState.turnLogs;
        const newlyAppendedLogs =
          result.logs && result.logs.length > 0
            ? result.logs
            : nextLogs.length > previousLogsCount
              ? nextLogs.slice(previousLogsCount)
              : [];

        if (newlyAppendedLogs.length > 0) {
          void TurnLogRepository.appendLogs(activeGameId, newlyAppendedLogs);
        }

        void GamePersistenceService.saveGameState(
          activeGameId,
          result.newState,
        );

        return {
          success: true,
          message: onSuccessMessage || result.message,
          resultData: result.resultData,
        };
      }

      return {
        success: false,
        message: result.message || "Action cannot be executed.",
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Action cannot be executed.";
      return {
        success: false,
        message,
      };
    }
  },

  advanceNextTurn: async () => {
    const { activeGameId, gameState } = get();
    if (!gameState) {
      return null;
    }
    try {
      const seed =
        gameState.seed || Math.floor(Math.random() * 1000000);

      const { newState, newTurnLogs } = await workerClient.advanceTurn(
        gameState,
        seed,
      );

      set({
        gameState: newState,
      });

      if (newTurnLogs.length > 0) {
        void TurnLogRepository.appendLogs(activeGameId, newTurnLogs);
      }

      void GamePersistenceService.saveGameState(activeGameId, newState);
      return newState;
    } catch (err) {
      console.error("Failed to advance turn via worker:", err);
      return null;
    }
  },

  enableSandboxMode: async () => {
    const { activeGameId, gameState } = get();
    if (!gameState) return;

    const updatedState = { ...gameState, isSandboxMode: true };
    set({
      gameState: updatedState,
    });

    void GamePersistenceService.saveGameState(activeGameId, updatedState);
  },
}));
