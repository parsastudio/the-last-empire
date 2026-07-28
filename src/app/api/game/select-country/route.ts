import { NextResponse } from "next/server";
import { SimulationFacade } from "@/application/map-rendering/simulation-facade";
import { normalizeNationId } from "@/application/map-rendering/game-state-initializer";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      nationId?: string;
      gameId?: string;
    };
    const { nationId, gameId } = body;

    if (!nationId) {
      return NextResponse.json(
        { success: false, error: "Nation ID is required" },
        { status: 400 },
      );
    }

    const normalized = normalizeNationId(nationId);
    const facade = new SimulationFacade();
    const state = facade.selectPlayerNation(normalized);

    if (gameId && state) {
      state.gameId = gameId;
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
