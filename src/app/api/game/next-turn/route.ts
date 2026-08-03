import { NextResponse } from "next/server";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";
import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedTurnOrchestrator } from "@/engine/orchestrator/final/bit-packed-turn-orchestrator";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId") || "default_game";

    let bodyState: GameState | undefined = undefined;
    try {
      const body = (await request.json()) as { state?: GameState };
      if (body && body.state) {
        bodyState = body.state;
      }
    } catch {}

    const orchestrator = new BitPackedTurnOrchestrator();

    let nextState = serverGameSessionStore.advanceTurn(gameId, bodyState);

    if (nextState) {
      nextState = orchestrator.processPostTurn(nextState);
    }

    if (!nextState) {
      return NextResponse.json(
        { success: false, error: "پیشبرد نوبت انجام نشد." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: nextState,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
