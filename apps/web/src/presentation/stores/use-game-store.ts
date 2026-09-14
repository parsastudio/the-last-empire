import { create } from "zustand";
import {
  GameState,
  GameAction,
  SeededRandom,
  FinalMapManifest,
  GameDifficulty,
} from "@geopolitics/domain";
import {
  ActionEngine,
  TurnProgressionOrchestrator,
} from "@geopolitics/game-engine";
import { CampaignInitializationService } from "@/presentation/stores/services/campaign-initialization-service";
import { GamePersistenceService } from "@/presentation/stores/services/game-persistence-service";
import { TurnLogRepository } from "@/infrastructure/storage/repositories/turn-log.repository";

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

const orchestrator = new TurnProgressionOrchestrator();

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

    const result = ActionEngine.execute(gameState, action);
    if (result.success && result.newState) {
      set({
        gameState: result.newState,
      });

      if (result.logs && result.logs.length > 0) {
        void TurnLogRepository.appendLogs(activeGameId, result.logs);
      }

      void GamePersistenceService.saveGameState(activeGameId, result.newState);

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
  },

  advanceNextTurn: async () => {
    const { activeGameId, gameState } = get();
    if (!gameState) {
      return null;
    }
    try {
      const prng = new SeededRandom(
        gameState.seed || Math.floor(Math.random() * 1000000),
      );

      const { newState, newTurnLogs } = orchestrator.advanceTurnWithLogs(
        gameState,
        prng,
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
      console.error("Failed to advance turn:", err);
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
