import { NextResponse } from "next/server";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GameStateInitializer } from "@/map-systems/test6/engine/game-state-initializer";
import { PlayerSessionManager } from "@/map-systems/test6/engine/player-session-manager";

export async function GET(): Promise<NextResponse> {
  try {
    const sessionManager = new PlayerSessionManager();
    const playerNationId = sessionManager.getPlayerNationId();
    if (!playerNationId) {
      return NextResponse.json({ success: true, data: null });
    }
    const gridState = GridStateProvider.getInstance();
    const initializer = new GameStateInitializer();
    const state = initializer.initializeSimulationForNation(
      playerNationId,
      gridState,
    );
    return NextResponse.json({ success: true, data: state });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
