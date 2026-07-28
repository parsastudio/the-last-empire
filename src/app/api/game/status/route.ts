import { NextResponse } from "next/server";
import { SimulationFacade } from "@/application/map-rendering/simulation-facade";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const nationIdParam = searchParams.get("nationId");

    const facade = new SimulationFacade();
    if (nationIdParam) {
      facade.selectPlayerNation(nationIdParam);
    }

    const state = facade.getActiveSessionState();
    return NextResponse.json({ success: true, data: state });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
