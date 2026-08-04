import { NextResponse } from "next/server";
import { normalizeNationId } from "@/infrastructure/map-preprocessing/game-state-initializer";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";
import { GridLoaderService } from "@/engine/combat/state/grid-loader.service";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const nationIdParam = searchParams.get("nationId") || "IRN";
    const gameIdParam = searchParams.get("gameId") || "default_game";
    const normalizedHumanId = normalizeNationId(nationIdParam);

    await GridLoaderService.ensureGridLoaded();

    const state = serverGameSessionStore.getOrInitState(
      gameIdParam,
      normalizedHumanId,
    );

    return NextResponse.json({ success: true, data: state });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
