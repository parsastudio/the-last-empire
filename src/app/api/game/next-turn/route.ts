import { NextResponse } from "next/server";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId") || "default_game";

    const nextState = serverGameSessionStore.advanceTurn(gameId);

    if (!nextState) {
      return NextResponse.json(
        { success: false, error: "نشست فعالی برای انجام نوبت بعدی یافت نشد" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: nextState });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
