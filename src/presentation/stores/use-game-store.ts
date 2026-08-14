import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { ActionEngine } from "@/engine/actions/action-engine";
import { TurnProgressionOrchestrator } from "@/engine/orchestrator/turn-progression.orchestrator";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { FinalMapManifest } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { CampaignInitializationService } from "@/presentation/stores/services/campaign-initialization-service";
import { GamePersistenceService } from "@/presentation/stores/services/game-persistence-service";

interface GameStoreState {
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  activeGameId: string;

  setGameState: (state: GameState | null) => void;
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
  ) => Promise<{ success: boolean; message: string }>;
  advanceNextTurn: () => Promise<GameState | null>;
}

const orchestrator = new TurnProgressionOrchestrator();

export const useGameStore = create<GameStoreState>()(
  immer((set, get) => ({
    gameState: null,
    loading: false,
    error: null,
    activeGameId: "default_game",

    setGameState: (state) =>
      set((draft) => {
        draft.gameState = state;
      }),

    loadGame: async (gameId) => {
      set((draft) => {
        draft.loading = true;
        draft.error = null;
        draft.activeGameId = gameId;
      });

      try {
        const updatedState = await GamePersistenceService.loadGameState(gameId);
        if (updatedState) {
          set((draft) => {
            draft.gameState = updatedState;
            draft.loading = false;
          });
          return true;
        }

        set((draft) => {
          draft.error = "اطلاعات پرونده بازی یافت نشد.";
          draft.loading = false;
        });
        return false;
      } catch {
        set((draft) => {
          draft.error = "خطا در بارگذاری اطلاعات از حافظه محلی.";
          draft.loading = false;
        });
        return false;
      }
    },

    createCampaign: async (nationId, governmentType, gameId, manifest) => {
      set((draft) => {
        draft.loading = true;
        draft.error = null;
        draft.activeGameId = gameId;
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

        set((draft) => {
          draft.gameState = initialState;
          draft.loading = false;
        });
        return true;
      } catch {
        set((draft) => {
          draft.error = "خطا در ساخت کمپین جدید.";
          draft.loading = false;
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
        set((draft) => {
          draft.gameState = result.newState ?? null;
        });
        void GamePersistenceService.saveGameState(
          activeGameId,
          result.newState,
        );

        return {
          success: true,
          message: onSuccessMessage || result.message,
        };
      }

      return {
        success: false,
        message: result.message || "امکان انجام این دستور وجود ندارد.",
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
        set((draft) => {
          draft.gameState = nextState;
        });
        void GamePersistenceService.saveGameState(activeGameId, nextState);
        return nextState;
      } catch {
        return null;
      }
    },
  })),
);
