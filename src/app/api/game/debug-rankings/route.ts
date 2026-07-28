import { NextResponse } from "next/server";
import { SimulationFacade } from "@/application/map-rendering/simulation-facade";
import { PowerScoreRanker } from "@/engine/diplomacy/power-score-ranker";

export async function GET(): Promise<NextResponse> {
  try {
    const facade = new SimulationFacade();
    const gameState = facade.getActiveSessionState();

    if (!gameState || !gameState.nations) {
      return NextResponse.json(
        { success: false, error: "Game state or nations not found" },
        { status: 404 },
      );
    }

    const rawList = Object.entries(gameState.nations).map(([id, n]) => ({
      id,
      gdp: n.gdp,
      treasury: n.treasury,
      infantry: n.military.infantry,
      airForce: n.military.airForce,
      drone: n.military.droneMissile,
    }));

    const ranker = new PowerScoreRanker();
    const ranked = ranker.rankNations(rawList);

    return NextResponse.json({
      success: true,
      totalNations: rawList.length,
      sampleRankings: ranked.slice(0, 10),
      sampleRawData: rawList.slice(0, 5),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
