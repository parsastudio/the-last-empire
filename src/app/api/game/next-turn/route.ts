import { NextResponse } from "next/server";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";
import { GameState } from "@/domain/game/game-state.schema";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GridLoaderService } from "@/engine/combat/state/grid-loader.service";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const t0 = performance.now();
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId") || "default_game";

    const gridState = GridStateProvider.getInstance();
    const tGridLoadStart = performance.now();
    await GridLoaderService.ensureGridLoaded(gridState);
    const tGridLoad = performance.now() - tGridLoadStart;

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

    const tEngineStart = performance.now();
    const nextState = engine.nextTurn();
    const tEngine = performance.now() - tEngineStart;

    const tModifiedStart = performance.now();
    const updatedGridCells = gridState.getModifiedCells();
    const tModified = performance.now() - tModifiedStart;

    const tJsonStart = performance.now();
    const response = NextResponse.json({
      success: true,
      data: nextState,
      gridCells: updatedGridCells,
    });
    const tJson = performance.now() - tJsonStart;

    const totalServer = performance.now() - t0;
    console.log(
      `[SERVER PERFORMANCE NEXT-TURN] Total: ${totalServer.toFixed(2)}ms | GridLoad: ${tGridLoad.toFixed(2)}ms | EngineNextTurn: ${tEngine.toFixed(2)}ms | GetModifiedCells: ${tModified.toFixed(2)}ms | JsonSerialize: ${tJson.toFixed(2)}ms`,
    );

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
