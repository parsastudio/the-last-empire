import { NextResponse } from "next/server";
import { SimulationFacade } from "@/application/map-rendering/simulation-facade";

export async function POST(): Promise<NextResponse> {
  try {
    const facade = new SimulationFacade();
    const nextState = facade.advanceTurn();
    if (!nextState) {
      return NextResponse.json(
        { success: false, error: "No active session" },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, data: nextState });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
