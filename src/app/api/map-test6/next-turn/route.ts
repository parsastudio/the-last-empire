import { NextResponse } from "next/server";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GameStateInitializer } from "@/map-systems/test6/engine/game-state-initializer";
import { PlayerSessionManager } from "@/map-systems/test6/engine/player-session-manager";
import { GameEngine } from "@/engine/game-engine";

export async function POST(): Promise<NextResponse> {
  try {
    const sessionManager = new PlayerSessionManager();
    const playerNationId = sessionManager.getPlayerNationId();
    if (!playerNationId) {
      return NextResponse.json(
        { success: false, error: "No active session" },
        { status: 400 },
      );
    }
    const gridState = GridStateProvider.getInstance();
    const initializer = new GameStateInitializer();
    const baseState = initializer.initializeSimulationForNation(
      playerNationId,
      gridState,
    );
    const engine = new GameEngine(baseState);
    const nextState = engine.nextTurn();
    return NextResponse.json({ success: true, data: nextState });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
