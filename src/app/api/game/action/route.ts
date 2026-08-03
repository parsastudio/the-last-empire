import { NextResponse } from "next/server";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";
import { GameAction } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      action?: GameAction;
      state?: GameState;
    } & GameAction;

    const action: GameAction = body.action || body;
    const currentState: GameState | undefined = body.state;

    if (!action || !action.type || !action.nationId) {
      return NextResponse.json(
        { success: false, message: "پارامترهای اکشن ناقص است." },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId") || "default_game";

    const result = serverGameSessionStore.dispatchAction(
      gameId,
      action,
      currentState,
    );

    if (!result || !result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result?.message || "امکان ثبت اکشن وجود ندارد.",
          error: result?.error,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message || `دستور ${action.type} با موفقیت ثبت شد.`,
      data: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
