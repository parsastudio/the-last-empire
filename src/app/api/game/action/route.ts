import { NextResponse } from "next/server";
import { serverGameSessionStore } from "@/application/game/server-game-session-store";
import { GameAction } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { SimulationFacade } from "@/infrastructure/map-preprocessing/simulation-facade";
import { normalizeNationId } from "@/infrastructure/map-preprocessing/game-state-initializer";

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

    let engine = serverGameSessionStore.getEngine(gameId);

    if (!engine && currentState) {
      engine = serverGameSessionStore.initSession(gameId, currentState);
    }

    if (!engine) {
      const rawNationCode = gameId.split("-")[0] || action.nationId || "IRN";
      const normalizedNation = normalizeNationId(rawNationCode);
      const facade = new SimulationFacade();
      const restoredState = facade.selectPlayerNation(normalizedNation);
      restoredState.gameId = gameId;
      engine = serverGameSessionStore.initSession(gameId, restoredState);
    }

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
