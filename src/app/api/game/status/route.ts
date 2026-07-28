import { NextResponse } from "next/server";
import { SimulationFacade } from "@/application/map-rendering/simulation-facade";
import { normalizeNationId } from "@/application/map-rendering/game-state-initializer";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const nationIdParam = searchParams.get("nationId") || "IRN";
    const gameIdParam = searchParams.get("gameId");
    const normalizedHumanId = normalizeNationId(nationIdParam);

    const facade = new SimulationFacade();
    const state = facade.selectPlayerNation(normalizedHumanId);

    if (gameIdParam && state) {
      state.gameId = gameIdParam;
    }

    return NextResponse.json({ success: true, data: state });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
