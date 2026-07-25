import { NextResponse } from "next/server";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { BattleValidationFacade } from "@/engine/combat/validation/battle-validation-facade";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      attackerId?: string;
      x?: number;
      y?: number;
    };
    const { attackerId, x, y } = body;

    if (!attackerId || x === undefined || y === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const gridState = GridStateProvider.getInstance();
    const validator = new BattleValidationFacade();

    const result = validator.validateAttackForUI(
      attackerId,
      { x, y },
      gridState,
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
