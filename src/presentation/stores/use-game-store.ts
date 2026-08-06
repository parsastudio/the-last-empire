import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { ClientGameService } from "@/presentation/services/client-game.service";

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
    manifest?: Parameters<ClientGameService["createCampaign"]>[3],
  ) => Promise<boolean>;
  dispatchAction: (
    action: GameAction,
    onSuccessMessage?: string,
  ) => Promise<{ success: boolean; message: string }>;
  advanceNextTurn: () => Promise<GameState | null>;
}

const gameService = new ClientGameService();

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

      const res = await gameService.loadGameState(gameId);

      if (res.success && res.data) {
        set((draft) => {
          draft.gameState = res.data ?? null;
          draft.loading = false;
        });
        return true;
      }

      set((draft) => {
        draft.error = res.error ?? "خطا در بارگذاری اطلاعات بازی";
        draft.loading = false;
      });
      return false;
    },

    createCampaign: async (nationId, governmentType, gameId, manifest) => {
      set((draft) => {
        draft.loading = true;
        draft.error = null;
        draft.activeGameId = gameId;
      });

      const res = await gameService.createCampaign(
        nationId,
        governmentType,
        gameId,
        manifest,
      );

      if (res.success && res.data) {
        set((draft) => {
          draft.gameState = res.data ?? null;
          draft.loading = false;
        });
        return true;
      }

      set((draft) => {
        draft.error = res.error ?? "خطا در ساخت کمپین جدید";
        draft.loading = false;
      });
      return false;
    },

    dispatchAction: async (action, onSuccessMessage) => {
      const { activeGameId, gameState } = get();
      if (!gameState) {
        return {
          success: false,
          message: "اطلاعات پرونده بازی یافت نشد.",
        };
      }

      const result = await gameService.dispatchAction(
        activeGameId,
        gameState,
        action,
        onSuccessMessage,
      );

      if (result.success && result.newState) {
        set((draft) => {
          draft.gameState = result.newState ?? null;
        });

        return {
          success: true,
          message: result.message,
        };
      }

      return {
        success: false,
        message: result.message ?? "امکان انجام این دستور وجود ندارد.",
      };
    },

    advanceNextTurn: async () => {
      const { activeGameId, gameState } = get();
      if (!gameState) return null;

      const res = await gameService.advanceTurn(activeGameId, gameState);

      if (res.success && res.data) {
        set((draft) => {
          draft.gameState = res.data ?? null;
        });
        return res.data;
      }

      return null;
    },
  })),
);
