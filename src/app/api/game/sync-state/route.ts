import { NextResponse } from "next/server";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";
import { GameState } from "@/domain/game/game-state.schema";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { state?: GameState };
    const { state } = body;

    if (!state || !state.gameId) {
      return NextResponse.json(
        { success: false, error: "Invalid state data provided" },
        { status: 400 },
      );
    }

    serverGameSessionStore.initSession(state.gameId, state);

    return NextResponse.json({
      success: true,
      message: "State synchronized with server session store",
      gameId: state.gameId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
