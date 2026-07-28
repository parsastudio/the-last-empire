import { NextResponse } from "next/server";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";
import { GameAction } from "@/domain/game/action.schema";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const action = (await request.json()) as GameAction;

    if (!action || !action.type || !action.nationId) {
      return NextResponse.json(
        { success: false, message: "پارامترهای اکشن ناقص است." },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId") || "default_game";

    const result = serverGameSessionStore.dispatchAction(gameId, action);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "نشست فعال بازی یافت نشد." },
        { status: 404 },
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `دستور ${action.type} با موفقیت ثبت شد.`,
      data: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
