import { NextResponse } from "next/server";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { CampaignCheatResolver } from "@/map-systems/test6/engine/campaign-cheat-resolver";
import { CampaignLogFormatter } from "@/map-systems/test6/engine/campaign-log-formatter";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      attackerId?: string;
      targetId?: string;
      x?: number;
      y?: number;
    };

    const { attackerId, targetId, x, y } = body;

    if (!attackerId || !targetId || x === undefined || y === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing parameters" },
        { status: 400 },
      );
    }

    const gridState = GridStateProvider.getInstance();
    const allCells = gridState.getAllCells();

    const resolver = new CampaignCheatResolver();
    const outcome = resolver.resolveGuaranteedInvasion(
      attackerId,
      targetId,
      { x, y },
      allCells,
    );

    const formatter = new CampaignLogFormatter();
    const message = formatter.formatInvasionLog(
      attackerId,
      targetId,
      outcome.conqueredCells.length,
      outcome.capitulatedCells.length,
    );

    return NextResponse.json({
      success: true,
      message,
      conquered: outcome.conqueredCells.length,
      capitulated: outcome.capitulatedCells.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
