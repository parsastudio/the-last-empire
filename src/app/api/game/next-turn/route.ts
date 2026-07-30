import { NextResponse } from "next/server";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";
import { GameState } from "@/domain/game/game-state.schema";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GridLoaderService } from "@/engine/combat/state/grid-loader.service";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId") || "default_game";

    const gridState = GridStateProvider.getInstance();
    await GridLoaderService.ensureGridLoaded(gridState);

    let bodyState: GameState | null = null;
    try {
      const body = (await request.json()) as { state?: GameState };
      if (body && body.state) {
        bodyState = body.state;
      }
    } catch {}

    let engine = serverGameSessionStore.getEngine(gameId);
    if (!engine && bodyState) {
      engine = serverGameSessionStore.initSession(gameId, bodyState);
    }

    if (!engine) {
      return NextResponse.json(
        { success: false, error: "نشست فعالی برای انجام نوبت بعدی یافت نشد" },
        { status: 400 },
      );
    }

    const nextState = engine.nextTurn();
    const updatedGridCells = gridState.getAllCells();

    return NextResponse.json({
      success: true,
      data: nextState,
      gridCells: updatedGridCells,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
