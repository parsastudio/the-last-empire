import { create } from "zustand";
import {
  GameState,
  GameAction,
  SeededRandom,
  FinalMapManifest,
} from "@geopolitics/domain";
import {
  ActionEngine,
  TurnProgressionOrchestrator,
} from "@geopolitics/game-engine";
import { CampaignInitializationService } from "@/presentation/stores/services/campaign-initialization-service";
import { GamePersistenceService } from "@/presentation/stores/services/game-persistence-service";

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
        error: "اطلاعات پرونده بازی یافت نشد.",
        loading: false,
      });
      return false;
    } catch {
      set({
        error: "خطا در بارگذاری اطلاعات از حافظه محلی.",
        loading: false,
      });
      return false;
    }
  },

  createCampaign: async (nationId, governmentType, gameId, manifest) => {
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
        );

      await GamePersistenceService.saveGameState(gameId, initialState);

      set({
        gameState: initialState,
        loading: false,
      });
      return true;
    } catch {
      set({
        error: "خطا در ساخت کمپین جدید.",
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
        message: "اطلاعات پرونده بازی یافت نشد.",
      };
    }

    const result = ActionEngine.execute(gameState, action);
    if (result.success && result.newState) {
      set({
        gameState: result.newState,
      });
      void GamePersistenceService.saveGameState(activeGameId, result.newState);

      return {
        success: true,
        message: onSuccessMessage || result.message,
        resultData: result.resultData,
      };
    }

    return {
      success: false,
      message: result.message || "امکان اجرای این دستور وجود ندارد.",
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

      const nextState = orchestrator.advanceTurn(gameState, prng);

      set({
        gameState: nextState,
      });

      void GamePersistenceService.saveGameState(activeGameId, nextState);
      return nextState;
    } catch {
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
