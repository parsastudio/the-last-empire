import { NextResponse } from "next/server";
import { SimulationFacade } from "@/infrastructure/map-preprocessing/simulation-facade";
import { normalizeNationId } from "@/infrastructure/map-preprocessing/game-state-initializer";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const nationIdParam = searchParams.get("nationId") || "IRN";
    const gameIdParam = searchParams.get("gameId") || "default_game";
    const normalizedHumanId = normalizeNationId(nationIdParam);

    let engine = serverGameSessionStore.getEngine(gameIdParam);
    if (!engine) {
      const facade = new SimulationFacade();
      const initialState = facade.selectPlayerNation(normalizedHumanId);
      initialState.gameId = gameIdParam;
      engine = serverGameSessionStore.initSession(gameIdParam, initialState);
    }

    const state = engine.getState();
    return NextResponse.json({ success: true, data: state });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
