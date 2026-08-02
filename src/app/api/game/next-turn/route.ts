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

    let bodyState: GameState | undefined = undefined;
    try {
      const body = (await request.json()) as { state?: GameState };
      if (body && body.state) {
        bodyState = body.state;
      }
    } catch {}

    const nextState = serverGameSessionStore.advanceTurn(gameId, bodyState);

    if (!nextState) {
      return NextResponse.json(
        { success: false, error: "پیشبرد نوبت انجام نشد." },
        { status: 400 },
      );
    }

    const updatedGridCells = gridState.getModifiedCells();

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
