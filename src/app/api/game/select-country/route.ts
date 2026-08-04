import { NextResponse } from "next/server";
import {
  GameStateInitializer,
  normalizeNationId,
} from "@/infrastructure/map-preprocessing/game-state-initializer";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      nationId?: string;
      governmentType?: string;
      gameId?: string;
    };
    const { nationId, governmentType, gameId } = body;

    if (!nationId) {
      return NextResponse.json(
        { success: false, error: "شناسه کشور الزامی است." },
        { status: 400 },
      );
    }

    const normalized = normalizeNationId(nationId);
    const initializer = new GameStateInitializer();
    const state = initializer.initializeSimulationForNation(
      normalized,
      governmentType,
    );

    const activeGameId = gameId || `game_${normalized}_${Date.now()}`;
    if (state) {
      state.gameId = activeGameId;
    }

    serverGameSessionStore.initSession(activeGameId, state);

    return NextResponse.json({ success: true, data: state });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
