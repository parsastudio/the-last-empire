import { NextResponse } from "next/server";
import { GameState } from "@/domain/game/game-state.schema";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { state?: GameState };
    const { state } = body;

    if (!state || !state.gameId) {
      return NextResponse.json(
        { success: false, error: "اطلاعات وضعیت معتبر نیست." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "همگام‌سازی وضعیت با سرور انجام شد.",
      gameId: state.gameId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای داخلی سیستم";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
