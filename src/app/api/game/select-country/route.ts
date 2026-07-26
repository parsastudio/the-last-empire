import { NextResponse } from "next/server";
import { SimulationFacade } from "@/application/map-rendering/simulation-facade";

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

    const facade = new SimulationFacade();
    facade.selectPlayerNation(nationId);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
