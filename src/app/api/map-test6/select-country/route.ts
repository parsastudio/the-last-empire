import { NextResponse } from "next/server";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GameStateInitializer } from "@/map-systems/test6/engine/game-state-initializer";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { nationId?: string };
    const { nationId } = body;

    if (!nationId) {
      return NextResponse.json(
        { success: false, error: "Nation ID is required" },
        { status: 400 },
      );
    }

    const gridState = GridStateProvider.getInstance();
    const initializer = new GameStateInitializer();
    initializer.initializeSimulationForNation(nationId, gridState);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
